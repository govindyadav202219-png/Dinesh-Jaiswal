
import React from 'react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Fast & Efficient',
    description: 'Best for standard invoices and quick results.',
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Powerful & Accurate',
    description: 'Recommended for complex layouts, blurry scans, or handwritten invoices.',
  },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  return (
    <div className="w-full">
      <fieldset>
        <legend className="text-lg font-semibold text-white mb-4">Select AI Model</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {models.map((model) => (
            <div key={model.id}>
              <input
                type="radio"
                id={model.id}
                name="model-selection"
                value={model.id}
                checked={selectedModel === model.id}
                onChange={() => onModelChange(model.id)}
                className="sr-only"
              />
              <label
                htmlFor={model.id}
                className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedModel === model.id
                    ? 'border-teal-400 bg-teal-900/50 shadow-lg'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <span className="text-md font-bold text-white">{model.name}</span>
                <span className="text-sm text-gray-400 mt-1">{model.description}</span>
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );
};
