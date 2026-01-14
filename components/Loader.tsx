
import React from 'react';

interface LoaderProps {
  progress: number;
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ progress, message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/80 rounded-lg">
      <div className="w-16 h-16 relative">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-gray-600"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="text-teal-400"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${progress}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-bold text-gray-300">
          {Math.round(progress)}%
        </div>
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-300">
        Analyzing Invoice...
      </p>
      <p className="text-sm text-gray-400 min-h-[20px]">
        {message}
      </p>
    </div>
  );
};
