import React from 'react';

const ErrorPopup = ({ message, isOpen, onClose }) => {
  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl border-l-4 border-red-500">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="text-2xl">&times;</span>
        </button>


        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-red-600">Something went wrong</h3>
          <p className="text-gray-700">{message}</p>
          
          <button 
            onClick={onClose}
            className="mt-4 rounded bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};


export default ErrorPopup;

