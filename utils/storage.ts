
import { type InvoiceData } from '../types';

const USER_KEY = 'invoice_extractor_user';
const USER_DATA_PREFIX = 'invoice_extractor_data_';

interface UserData {
  lastInvoice: {
    invoiceData: InvoiceData;
    pdfBase64: string;
    pdfName: string;
    pdfMimeType: string;
  } | null;
  todayStats: {
    date: string; // YYYY-MM-DD
    invoicesProcessed: number;
    itemsExtracted: number;
  };
}

// --- File Utilities ---

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
};


// --- User Management ---

export const getLoggedInUser = (): string | null => {
  return localStorage.getItem(USER_KEY);
};

export const loginUser = (name: string): void => {
  localStorage.setItem(USER_KEY, name);
};

export const logoutUser = (): void => {
  const user = getLoggedInUser();
  if (user) {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(`${USER_DATA_PREFIX}${user}`);
  }
};

// --- User Data Management ---

const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getUserData = (name: string): UserData => {
  const dataString = localStorage.getItem(`${USER_DATA_PREFIX}${name}`);
  const defaultData: UserData = {
    lastInvoice: null,
    todayStats: {
      date: getTodayString(),
      invoicesProcessed: 0,
      itemsExtracted: 0,
    },
  };

  if (!dataString) {
    return defaultData;
  }

  try {
    const parsedData = JSON.parse(dataString) as UserData;
    // Reset stats if it's a new day
    if (parsedData.todayStats.date !== getTodayString()) {
      return { ...parsedData, todayStats: defaultData.todayStats };
    }
    return parsedData;
  } catch (e) {
    console.error("Failed to parse user data from localStorage", e);
    return defaultData;
  }
};

export const saveUserData = (name: string, data: UserData): void => {
  try {
    const dataString = JSON.stringify(data);
    localStorage.setItem(`${USER_DATA_PREFIX}${name}`, dataString);
  } catch (e) {
    console.error("Failed to save user data to localStorage", e);
  }
};

export const updateStatsAndSaveInvoice = async (
    name: string,
    invoiceData: InvoiceData,
    pdfFile: File
): Promise<UserData> => {
    const currentUserData = getUserData(name);

    // Update stats
    const newStats = {
        date: getTodayString(),
        invoicesProcessed: currentUserData.todayStats.invoicesProcessed + 1,
        itemsExtracted: currentUserData.todayStats.itemsExtracted + (invoiceData.lineItems?.length || 0),
    };
    
    // Prepare invoice for storage
    const pdfBase64 = await fileToBase64(pdfFile);
    const newLastInvoice = {
        invoiceData,
        pdfBase64,
        pdfName: pdfFile.name,
        pdfMimeType: pdfFile.type
    };

    const newUserData: UserData = {
        lastInvoice: newLastInvoice,
        todayStats: newStats,
    };

    saveUserData(name, newUserData);
    return newUserData;
};
