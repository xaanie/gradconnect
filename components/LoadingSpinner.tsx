import React from 'react';

const LoadingSpinner: React.FC<{ subject?: string }> = ({ subject }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-16 h-16 border-4 border-zim-green border-t-zim-yellow rounded-full animate-spin"></div>
      <p className="text-lg font-semibold text-gray-700">
        Thinking... {subject ? `Generating ${subject}...` : 'Processing...'}
      </p>
      <p className="text-sm text-gray-500">Consulting MoPSE Syllabuses...</p>
    </div>
  );
};

export default LoadingSpinner;
