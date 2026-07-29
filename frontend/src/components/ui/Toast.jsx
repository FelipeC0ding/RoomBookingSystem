import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

/**
 * High-character Toast component for operational status messages.
 */
export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isError = type === 'error';
  const isInfo = type === 'info';

  const icons = {
    error: <AlertCircle size={16} className="text-red-400 shrink-0" />,
    info: <Info size={16} className="text-sky-400 shrink-0" />,
    success: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
  };

  const borders = {
    error: "border-red-800/80 bg-red-950/90 text-red-200",
    info: "border-sky-800/80 bg-sky-950/90 text-sky-200",
    success: "border-emerald-800/80 bg-emerald-950/90 text-emerald-200"
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 border rounded-md shadow-[4px_4px_0px_rgba(0,0,0,0.9)] font-sans text-xs font-medium animate-fade-in ${borders[type] || borders.success}`}>
      {icons[type] || icons.success}
      <span>{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default Toast;
