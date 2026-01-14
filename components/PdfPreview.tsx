
import React, { useState, useEffect } from 'react';

interface PdfPreviewProps {
  file: File | null;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ file }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      try {
        const url = URL.createObjectURL(file);
        setFileUrl(url);

        // Cleanup to prevent memory leaks
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (e) {
        console.error("Error creating object URL for PDF", e);
      }
    } else {
      setFileUrl(null);
    }
  }, [file]);

  if (!file || !fileUrl) {
    return null;
  }

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-xl font-bold text-white">Document Preview</h3>
        <div className="flex space-x-3">
             <a 
              href={fileUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Open in New Tab
            </a>
        </div>
      </div>
      
      <div className="w-full h-[600px] bg-gray-900 rounded-md overflow-hidden border border-gray-600">
        <iframe 
            src={fileUrl} 
            title="PDF Document Preview"
            className="w-full h-full"
        >
            {/* Fallback for browsers that don't support iframes or PDF viewing */}
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <p className="text-gray-400 mb-2">Unable to display PDF preview directly.</p>
                <a href={fileUrl} download={file.name} className="text-teal-400 hover:text-teal-300 underline">
                    Download PDF to view
                </a>
            </div>
        </iframe>
      </div>
    </div>
  );
};
