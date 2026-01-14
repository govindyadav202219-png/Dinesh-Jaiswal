
import React, { useState, useMemo, useEffect } from 'react';

interface LoginProps {
  onLogin: (name: string) => void;
}

// Admin Accounts that require password
const ADMIN_ACCOUNTS = [
  { username: 'Dinesh', password: 'Jaiswal@123' },
  { username: 'developer', password: 'devaccess2024' },
  { username: 'Admin', password: 'Admin@123' },
];

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if the entered name matches an admin account
  const isAdmin = useMemo(() => {
    return ADMIN_ACCOUNTS.some(
      acc => acc.username.toLowerCase() === userName.trim().toLowerCase()
    );
  }, [userName]);

  // Clear error when switching modes
  useEffect(() => {
    setError(null);
    if (!isAdmin) setPassword('');
  }, [isAdmin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const cleanName = userName.trim();
    if (!cleanName) return;

    if (isAdmin) {
      const account = ADMIN_ACCOUNTS.find(
        acc => acc.username.toLowerCase() === cleanName.toLowerCase()
      );
      
      if (account && account.password === password) {
        onLogin(account.username); // Log in with the canonical admin name
      } else {
        setError('Invalid password for Admin access.');
      }
    } else {
      // Regular user - direct login
      onLogin(cleanName);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8 animate-fadeIn">
         <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
          Industrial OCR <span className="text-teal-400">Pro</span>
         </h2>
         <p className="text-gray-400">
          Professional PDF to Excel converter powered by Gemini AI. 
          <br/>Supports 500+ items and custom headers.
         </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl p-8 space-y-6 text-center relative overflow-hidden transition-all duration-500"
        aria-label="Login form"
      >
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${isAdmin ? 'from-teal-500 to-emerald-500' : 'from-blue-500 to-indigo-500'} transition-all duration-500`}></div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isAdmin ? 'Admin Portal' : 'Start Processing'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isAdmin 
              ? 'Authorized personnel only.' 
              : 'Enter your name to begin extraction.'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-left">
            <label htmlFor="user-name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-1">
              User Identification
            </label>
            <input
              id="user-name"
              name="userName"
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 text-white bg-gray-900 border border-gray-600 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. Dinesh or Guest"
              autoFocus
            />
          </div>

          {/* Conditional Password Field for Admins */}
          {isAdmin && (
            <div className="text-left animate-fadeIn">
              <label htmlFor="password" className="block text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1 ml-1">
                Security Key Required
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required={isAdmin}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-white bg-gray-900 border border-teal-500/50 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          )}
        </div>

        {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 animate-pulse">
              <p className="text-sm text-red-400">{error}</p>
            </div>
        )}

        <button
          type="submit"
          className={`w-full font-bold py-3 px-4 rounded-xl text-white shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 
            ${isAdmin 
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-500/20' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
            }`}
          disabled={!userName.trim()}
        >
          {isAdmin ? 'Verify & Access' : 'Launch OCR Engine'}
        </button>

        <div className="pt-4 border-t border-gray-700/50 flex justify-center gap-4">
           <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 9.503l7.834-4.603a1.166 1.166 0 00-1.167-1.997l-6.667 3.916L3.333 2.9a1.166 1.166 0 00-1.167 1.997zM2.166 14.9l7.834 4.603 7.834-4.603a1.166 1.166 0 00-1.167-1.997l-6.667 3.916L3.333 12.9a1.166 1.166 0 00-1.167 1.997z" clipRule="evenodd"/></svg>
              Fast OCR
           </div>
           <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
              Secure
           </div>
        </div>
      </form>
    </div>
  );
};
