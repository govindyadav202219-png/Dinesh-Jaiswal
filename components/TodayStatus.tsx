
import React from 'react';

interface TodayStatusProps {
  stats: {
    invoicesProcessed: number;
    itemsExtracted: number;
  };
}

export const TodayStatus: React.FC<TodayStatusProps> = ({ stats }) => {
  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Today's Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <p className="text-3xl font-bold text-teal-400">{stats.invoicesProcessed}</p>
          <p className="text-sm text-gray-400">Invoices Processed</p>
        </div>
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <p className="text-3xl font-bold text-blue-400">{stats.itemsExtracted}</p>
          <p className="text-sm text-gray-400">Items Extracted</p>
        </div>
      </div>
    </div>
  );
};
