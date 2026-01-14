
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { Loader } from './components/Loader';
import { Login } from './components/Login';
import { ModelSelector } from './components/ModelSelector';
import { TodayStatus } from './components/TodayStatus';
import { DataCorrection } from './components/DataCorrection';
import { extractInvoiceData, refineInvoiceData } from './services/geminiService';
import { type InvoiceData } from './types';
import { 
  getLoggedInUser, 
  loginUser, 
  logoutUser, 
  getUserData,
  saveUserData,
  base64ToFile,
  updateStatsAndSaveInvoice
} from './utils/storage';

interface TodayStats {
  invoicesProcessed: number;
  itemsExtracted: number;
}

export default function App() {
  const [userName, setUserName] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCorrecting, setIsCorrecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');
  const [progress, setProgress] = useState({ percentage: 0, message: '' });
  const [todayStats, setTodayStats] = useState<TodayStats>({ invoicesProcessed: 0, itemsExtracted: 0 });

  useEffect(() => {
    const loggedInUser = getLoggedInUser();
    if (loggedInUser) {
      const userData = getUserData(loggedInUser);
      setUserName(loggedInUser);
      setTodayStats(userData.todayStats);
      if (userData.lastInvoice) {
        setInvoiceData(userData.lastInvoice.invoiceData);
        const file = base64ToFile(
          userData.lastInvoice.pdfBase64,
          userData.lastInvoice.pdfName,
          userData.lastInvoice.pdfMimeType
        );
        setPdfFile(file);
      }
    }
  }, []);


  const handleFileProcess = useCallback(async (file: File) => {
    if (!userName) return;

    setIsLoading(true);
    setError(null);
    setInvoiceData(null);
    setPdfFile(file);
    setProgress({ percentage: 0, message: 'Starting...' });

    const onProgress = (percentage: number, message: string) => {
      setProgress({ percentage, message });
    };

    try {
      const data = await extractInvoiceData(file, selectedModel, onProgress);
      const newUserData = await updateStatsAndSaveInvoice(userName, data, file);
      
      setInvoiceData(data);
      setTodayStats(newUserData.todayStats);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel, userName]);

  const handleDataCorrection = async (instruction: string) => {
    if (!invoiceData || !userName || !pdfFile) return;

    setIsCorrecting(true);
    setError(null);

    try {
      const updatedData = await refineInvoiceData(invoiceData, instruction, selectedModel);
      setInvoiceData(updatedData);

      // Persist the updated data to local storage
      const userData = getUserData(userName);
      if (userData.lastInvoice) {
        const updatedUserData = {
          ...userData,
          lastInvoice: {
            ...userData.lastInvoice,
            invoiceData: updatedData
          }
        };
        saveUserData(userName, updatedUserData);
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to update data based on your request.');
    } finally {
      setIsCorrecting(false);
    }
  };

  const handleRetry = () => {
    if (pdfFile) {
        handleFileProcess(pdfFile);
    }
  };

  const handleReset = () => {
    setInvoiceData(null);
    setError(null);
    setIsLoading(false);
    setPdfFile(null);
    setProgress({ percentage: 0, message: '' });
  };

  const handleLogin = (name: string) => {
    loginUser(name);
    const userData = getUserData(name);
    setUserName(name);
    setTodayStats(userData.todayStats);
  };

  const handleLogout = () => {
    logoutUser();
    setUserName(null);
    handleReset();
    setTodayStats({ invoicesProcessed: 0, itemsExtracted: 0 });
  };

  const renderContent = () => {
    if (!userName) {
      return <Login onLogin={handleLogin} />;
    }

    if (isLoading) {
      return <Loader progress={progress.percentage} message={progress.message} />;
    }
    
    if (error && !invoiceData) {
      return (
        <div className="text-center p-8 bg-gray-800 border border-red-500/50 rounded-2xl shadow-xl max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-4">
             <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Processing Failed</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
                Upload New File
            </button>
            {pdfFile && (
                <button
                    onClick={handleRetry}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-red-600/20"
                >
                    Retry
                </button>
            )}
          </div>
        </div>
      );
    }

    if (invoiceData) {
      return (
        <div className="space-y-6 relative">
          {isCorrecting && (
             <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-lg">
                <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-teal-500/30 flex flex-col items-center">
                   <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                   <p className="text-white font-bold">AI is Restructuring Data...</p>
                   <p className="text-xs text-gray-400 mt-1 italic">Mapping headers and fixing rows</p>
                </div>
             </div>
          )}
          <DataTable invoiceData={invoiceData} onReset={handleReset} fileName={pdfFile?.name || 'invoice'} />
          <DataCorrection onUpdate={handleDataCorrection} isUpdating={isCorrecting} />
          {error && (
             <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm text-center">
                {error}
             </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <TodayStatus stats={todayStats} />
        <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
        <FileUpload onFileSelect={handleFileProcess} disabled={isLoading} />
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col antialiased">
      <Header userName={userName} onLogout={handleLogout} />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-5xl mx-auto space-y-8">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
