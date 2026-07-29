import React from 'react';

/**
 * Sharp, high-contrast Input component.
 * Replaces white input boxes with dark ink inputs, hairline borders, clear typography.
 */
export function Input({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-display font-medium tracking-wide uppercase text-slate-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 text-slate-500 pointer-events-none flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full bg-[#121721] text-slate-100 placeholder:text-slate-600 border border-[#21262d] rounded-md px-3.5 py-2.5 text-sm font-sans outline-none transition-all duration-150 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500/80' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[11px] font-sans text-red-400 tracking-tight flex items-center gap-1">
          {error}
        </span>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  icon: Icon,
  children,
  className = '',
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-display font-medium tracking-wide uppercase text-slate-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 text-slate-500 pointer-events-none flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
        <select
          id={selectId}
          className={`w-full bg-[#121721] text-slate-100 border border-[#21262d] rounded-md px-3.5 py-2.5 text-sm font-sans outline-none transition-all duration-150 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 cursor-pointer ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500/80' : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
      {error && (
        <span className="text-[11px] font-sans text-red-400 tracking-tight">
          {error}
        </span>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className = '',
  id,
  rows = 3,
  ...props
}) {
  const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={areaId} className="text-xs font-display font-medium tracking-wide uppercase text-slate-400">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        rows={rows}
        className={`w-full bg-[#121721] text-slate-100 placeholder:text-slate-600 border border-[#21262d] rounded-md px-3.5 py-2.5 text-sm font-sans outline-none transition-all duration-150 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 resize-none ${error ? 'border-red-500/80' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[11px] font-sans text-red-400 tracking-tight">
          {error}
        </span>
      )}
    </div>
  );
}

export default Input;
