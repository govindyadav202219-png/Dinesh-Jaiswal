
import { GoogleGenAI, Type } from "@google/genai";
import { type InvoiceData } from '../types';

type ProgressCallback = (percentage: number, message: string) => void;

const pdfPageToImageBase64 = async (file: File, onProgress: ProgressCallback): Promise<{ base64: string; mimeType: string; }> => {
  onProgress(10, 'Reading PDF file...');
  const fileBuffer = await file.arrayBuffer();

  onProgress(20, 'Parsing PDF structure...');
  // @ts-ignore
  const pdf = await pdfjsLib.getDocument(fileBuffer).promise;
  const pageCount = pdf.numPages;
  
  // For 500 products, we usually need to process multiple pages, 
  // but for this MVP we focus on high-fidelity extraction of the primary table.
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.5 }); 
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error("Could not get canvas context");

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  onProgress(40, 'Capturing high-res document image...');
  await page.render({ canvasContext: context, viewport: viewport }).promise;

  onProgress(60, 'Optimizing for high-volume OCR...');
  const mimeType = 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, 0.85);
  
  return { base64: dataUrl.split(',')[1], mimeType };
};

export async function extractInvoiceData(file: File, modelName: string, onProgress: ProgressCallback): Promise<InvoiceData> {
  onProgress(0, 'Initializing OCR Engine...');
  
  let base64, mimeType;
  try {
    ({ base64, mimeType } = await pdfPageToImageBase64(file, onProgress));
  } catch (e) {
    throw new Error("Failed to process PDF file. Ensure it is a valid document.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      data: base64,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: `You are a High-Capacity Industrial Data OCR Engine. 
    TASK: Extract EVERY single product row from the provided invoice. 
    DO NOT TRUNCATE. If there are 100, 200, or 500 rows, you MUST capture them all.
    
    COLUMNS (Strict Mapping):
    - SR: Serial/Index
    - INV: Invoice #
    - DT: Date
    - CODE: Part Number / Model / SKU
    - DESC: Full Item Description
    - QTY: Quantity (Number)
    - UOM: Unit (PCS, KG, etc)
    - U.P: Unit Price (Number)
    - TOT: Row Total (Number)
    - HS: HS Code / HSN
    - COO: Country of Origin
    - STD: Standard / Grade
    - Lot NO: Batch or Lot ID
    - Exp: Expiry Date
    - Fab: Manufacturing/Fabrication Date
    
    SPECIAL INSTRUCTION: 
    Users may use shorthand headers like 'h' for HS Code or 'mod' for CODE. 
    Intelligently map them to the correct fields.`,
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
    onProgress(75, 'AI is processing 500+ potential rows...');
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        maxOutputTokens: 65536, // Maximum capacity for high-volume rows
      },
    });

    onProgress(95, 'Structuring Excel data...');
    const jsonText = response.text;
    if (!jsonText) throw new Error("API returned no data. Check your PDF quality.");

    const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '').trim();
    const parsedData = JSON.parse(cleanedJsonText) as InvoiceData;
    onProgress(100, 'Success!');
    return parsedData;

  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes('API_KEY')) {
        throw new Error("Invalid or Missing API Key. Please configure the environment.");
    }
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
    SYSTEM: You are a Master Data Restructurer. 
    The user is reporting that some headers were misidentified or data is in the wrong column.
    
    ACTION: Perform bulk updates across ALL items.
    Example: "Map 'DESC' to 'CODE'" means move all data from description field to the code field.

    USER REQUEST: "${instruction}"
    
    CURRENT JSON:
    ${JSON.stringify(currentData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 65536,
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
