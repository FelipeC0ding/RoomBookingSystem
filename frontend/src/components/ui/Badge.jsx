import React from 'react';

/**
 * High-character, sharp Badge component.
 * Replaces generic rounded pills with crisp status badges.
 */
export function Badge({
  children,
  variant = 'default', // 'default' | 'amber' | 'emerald' | 'crimson' | 'sky' | 'slate'
  size = 'md',        // 'sm' | 'md'
  icon: Icon,
  className = '',
}) {
  const base = "inline-flex items-center font-display font-medium uppercase tracking-wider border rounded-sm transition-all";
  
  const variants = {
    default: "bg-[#161b22] text-slate-300 border-[#30363d]",
    amber: "bg-amber-950/40 text-amber-400 border-amber-800/60",
    emerald: "bg-emerald-950/40 text-emerald-400 border-emerald-800/60",
    crimson: "bg-red-950/40 text-red-400 border-red-800/60",
    sky: "bg-sky-950/40 text-sky-400 border-sky-800/60",
    slate: "bg-[#0d1117] text-slate-400 border-[#21262d]"
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-[11px] gap-1.5"
  };

  return (
    <span className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}>
      {Icon && <Icon size={size === 'sm' ? 10 : 12} className="shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
