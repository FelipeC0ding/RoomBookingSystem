import React from 'react';

/**
 * Tactical, sharp, opinionated Button component.
 * Avoids soft rounded-2xl buttons, diffuse drop-shadows, and purple gradients.
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-display font-medium tracking-tight border transition-all duration-150 active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-amber-500/50";
  
  const variants = {
    primary: "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-[2px_2px_0px_rgba(0,0,0,0.9)] font-semibold",
    secondary: "bg-[#161b22] hover:bg-[#21262d] text-slate-200 border-[#30363d] shadow-[2px_2px_0px_rgba(0,0,0,0.8)]",
    outline: "bg-transparent hover:bg-[#161b22] text-slate-300 border-[#30363d] hover:border-[#444c56]",
    ghost: "bg-transparent hover:bg-[#161b22] text-slate-400 hover:text-slate-200 border-transparent",
    danger: "bg-red-950/80 hover:bg-red-900/90 text-red-200 border-red-800/80 shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-sm gap-1.5",
    md: "px-4 py-2 text-sm rounded-md gap-2",
    lg: "px-6 py-3 text-base rounded-md gap-2.5"
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export default Button;
