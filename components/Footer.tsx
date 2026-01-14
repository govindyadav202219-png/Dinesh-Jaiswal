
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 mt-8 border-t border-gray-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} - Developed by Dinesh JAISWAL</p>
      </div>
    </footer>
  );
};
