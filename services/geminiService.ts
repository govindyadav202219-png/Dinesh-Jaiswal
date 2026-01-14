
import { GoogleGenAI, Type } from "@google/genai";
import { type InvoiceData } from '../types';

type ProgressCallback = (percentage: number, message: string) => void;

const pdfPageToImageBase64 = async (file: File, onProgress: ProgressCallback): Promise<{ base64: string; mimeType: string; }> => {
  onProgress(10, 'Reading PDF file...');
  const fileBuffer = await file.arrayBuffer();

  onProgress(20, 'Parsing PDF structure...');
  // @ts-ignore
  const pdf = await pdfjsLib.getDocument(fileBuffer).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.5 }); 
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error("Could not get canvas context");

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  onProgress(40, 'Capturing invoice image...');
  await page.render({ canvasContext: context, viewport: viewport }).promise;

  onProgress(60, 'Optimizing data for AI...');
  const mimeType = 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, 0.85);
  
  return { base64: dataUrl.split(',')[1], mimeType };
};

export async function extractInvoiceData(file: File, modelName: string, onProgress: ProgressCallback): Promise<InvoiceData> {
  onProgress(0, 'Starting extraction process...');
  
  let base64, mimeType;
  try {
    ({ base64, mimeType } = await pdfPageToImageBase64(file, onProgress));
  } catch (e) {
    throw new Error("Failed to process PDF file.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      data: base64,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: `You are a professional Data OCR Specialist. 
    TASK: Extract EVERY product row from the invoice table into the exact JSON schema provided.
    
    COLUMNS TO CAPTURE:
    - SR: Row sequence
    - INV: Invoice Number
    - DT: Invoice Date
    - CODE: Item Code / Model
    - DESC: Product Description
    - QTY: Quantity
    - UOM: Units (e.g. PCS, UNT)
    - U.P: Unit Price
    - TOT: Total Amount
    - HS: HS Code / Harmonized System
    - COO: Country of Origin
    - STD: Standard
    - Lot NO: Batch/Lot Number
    - Exp: Expiry Date
    - Fab: Fabrication/Production Date
    
    MAPPING LOGIC: 
    - If a header is labeled 'h', 'hkya', or 'H.S.', map it to 'hsCode'.
    - If 'U.P' or 'Price' is found, map to 'unitPrice'.
    - If 'TOT' or 'Amount' is found, map to 'total'.
    - Capture all 500+ rows if present.`,
  };
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      serialNumber: { type: Type.STRING, nullable: true },
      invoiceNumber: { type: Type.STRING, nullable: true },
      invoiceDate: { type: Type.STRING, nullable: true },
      lineItems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sr: { type: Type.STRING, nullable: true },
            inv: { type: Type.STRING, nullable: true },
            dt: { type: Type.STRING, nullable: true },
            code: { type: Type.STRING, nullable: true },
            description: { type: Type.STRING, nullable: true },
            qty: { type: Type.NUMBER, nullable: true },
            uom: { type: Type.STRING, nullable: true },
            unitPrice: { type: Type.NUMBER, nullable: true },
            total: { type: Type.NUMBER, nullable: true },
            hsCode: { type: Type.STRING, nullable: true },
            coo: { type: Type.STRING, nullable: true },
            std: { type: Type.STRING, nullable: true },
            lotNumber: { type: Type.STRING, nullable: true },
            expDate: { type: Type.STRING, nullable: true },
            fabDate: { type: Type.STRING, nullable: true },
          },
        },
      },
    },
    required: ["lineItems"],
  };

  try {
    onProgress(70, 'AI is analyzing 15-column table structure...');
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        maxOutputTokens: 25000,
      },
    });

    onProgress(90, 'Validating data integrity...');
    const jsonText = response.text;
    if (!jsonText) throw new Error("API returned an empty response.");

    const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '').trim();
    const parsedData = JSON.parse(cleanedJsonText) as InvoiceData;
    onProgress(100, 'Success!');
    return parsedData;

  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(`Extraction Failed: ${error.message}`);
  }
}

export async function refineInvoiceData(
  currentData: InvoiceData, 
  instruction: string, 
  modelName: string
): Promise<InvoiceData> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    SYSTEM: You are a Master Data Editor. 
    You must modify the current JSON data based on the user's specific feedback.
    
    SCENARIOS TO HANDLE:
    1. Header Re-mapping: If the user says "Column X should be HS Code", move all data from X to the 'hsCode' field for every item.
    2. Bulk Fixes: If the user says "Set all INV to 1234", update all items.
    3. Corrections: "Row 5 model is wrong, change it to ABC".
    4. Data Recovery: "You missed the 'h' column, it contains the HS codes".

    ALLOWED FIELDS IN JSON:
    [sr, inv, dt, code, description, qty, uom, unitPrice, total, hsCode, coo, std, lotNumber, expDate, fabDate]

    USER INSTRUCTION: "${instruction}"
    
    CURRENT JSON DATA:
    ${JSON.stringify(currentData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 25000,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Refinement failed.");
    const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '').trim();
    return JSON.parse(cleanedJsonText) as InvoiceData;
  } catch (error: any) {
    throw new Error(`Update Failed: ${error.message}`);
  }
}
