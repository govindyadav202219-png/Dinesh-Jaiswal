
import React, { useState } from 'react';

interface DataCorrectionProps {
  onUpdate: (instruction: string) => void;
  isUpdating: boolean;
}

const SUGGESTIONS = [
  "Map 'h' column to HS Code",
  "Delete rows where Qty is 0",
  "Fix all date formats to DD-MM-YYYY",
  "Move 'DESC' info into 'CODE' field",
  "Recalculate Totals (Qty * U.P)",
];

export const DataCorrection: React.FC<DataCorrectionProps> = ({ onUpdate, isUpdating }) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim()) {
      onUpdate(instruction);
      setInstruction('');
    }
  };

  const handleSuggestion = (text: string) => {
    onUpdate(text);
  };

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-teal-500/20 p-2 rounded-lg">
           <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-white">Advanced AI Data Control</h3>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">
        Tell the AI exactly what to fix. You can map columns, fix typos, or update entire headers.
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSuggestion(s)}
            disabled={isUpdating}
            className="text-[10px] md:text-xs py-1 px-3 bg-gray-700 hover:bg-teal-600/30 text-gray-300 border border-gray-600 rounded-full transition-all disabled:opacity-50"
          >
            + {s}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          rows={2}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. 'The column labeled hkya is actually HS Code, please update all rows...'"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"
          disabled={isUpdating}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!instruction.trim() || isUpdating}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center min-w-[160px]"
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Apply Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
