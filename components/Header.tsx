
import React, { useState } from 'react';
import { Logo } from './Logo';
import { useTime } from '../hooks/useTime';

interface HeaderProps {
  userName: string | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userName, onLogout }) => {
  const { greeting, formattedDate, formattedTime } = useTime();
  const [showToast, setShowToast] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'AI PDF to Excel OCR',
      text: 'Extract invoice data to Excel/CSV with AI. Professional tool for high-volume invoices.',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <header className="w-full bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 shadow-lg sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Logo />
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">
            PDF Invoice Extractor
          </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={handleShare}
            className="hidden xs:flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm bg-gray-800 hover:bg-gray-700 text-teal-400 border border-teal-500/30 font-bold rounded-lg transition-all"
            title="Share this tool"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            <span className="hidden md:inline">Share</span>
          </button>
          
          {userName && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-gray-300 font-semibold text-xs md:text-sm">{greeting}, {userName}</p>
                <p className="text-[10px] text-gray-500">{formattedDate} | {formattedTime}</p>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-xs sm:text-sm bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-bold rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 share-toast bg-teal-600 text-white px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span className="font-semibold">Link copied to clipboard!</span>
        </div>
      )}
    </header>
  );
};
