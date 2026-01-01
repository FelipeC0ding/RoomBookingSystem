import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

function PopUp({ isOpen, onClose, type = 'success', title, message }) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in slide-in-from-bottom-8 duration-300 text-center border border-gray-100 relative">

        {/* Close button in top right corner */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        {/* Dynamic Icon Section */}
        <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 ${
          isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {isSuccess ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
          {title || (isSuccess ? 'Success!' : 'Something went wrong')}
        </h3>

        <p className="text-gray-500 mb-8 leading-relaxed">
          {message}
        </p>

        <button
          onClick={onClose}
          className={`w-full py-4 px-4 font-bold rounded-xl transition-all shadow-lg active:scale-95 ${
            isSuccess ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
          } text-white`}
        >
          {isSuccess ? 'Continue' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}

export default PopUp;