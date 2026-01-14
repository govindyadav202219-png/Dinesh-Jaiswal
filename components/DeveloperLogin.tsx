
import React, { useState } from 'react';

interface DeveloperLoginProps {
  onAuthSuccess: () => void;
}

// NOTE: In a real-world application, these credentials should not be hardcoded.
// They should be handled via a secure authentication backend.
const DEVELOPER_ACCOUNTS = [
  { username: 'Dinesh', password: 'Jaiswal@123' },
  { username: 'developer', password: 'devaccess2024' },
  { username: 'Admin', password: 'Admin@123' },
];

export const DeveloperLogin: React.FC<DeveloperLoginProps> = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = DEVELOPER_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === username.trim().toLowerCase() && acc.password === password
    );

    if (foundUser) {
      setError(null);
      onAuthSuccess();
    } else {
      setError('Invalid credentials. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 border border-gray-700 shadow-2xl rounded-2xl p-8 space-y-6 text-center relative overflow-hidden"
        aria-label="Developer access form"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Admin Access
          </h2>
          <p className="text-gray-400 text-sm">Please authenticate to unlock the system.</p>
        </div>

        <div className="space-y-4">
          <div className="text-left">
            <label htmlFor="dev-username" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-1">
              Username
            </label>
            <input
              id="dev-username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 text-white bg-gray-900/50 border border-gray-600 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="Admin Username"
              autoFocus
            />
          </div>
          <div className="text-left">
             <label htmlFor="dev-password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-1">
              Password
            </label>
            <input
              id="dev-password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-white bg-gray-900/50 border border-gray-600 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
        )}

        <button
          type="submit"
          className="w-full font-bold py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white shadow-lg shadow-teal-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!username.trim() || !password.trim()}
        >
          Unlock Application
        </button>
      </form>
    </div>
  );
};
