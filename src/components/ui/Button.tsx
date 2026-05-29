'use client';

import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  active?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--accent-primary)] text-white hover:bg-purple-600 shadow-[0_0_20px_rgba(124,58,237,0.3)]',
  secondary: 'bg-[var(--bg-panel)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-panel-hover)] hover:border-[var(--border-strong)]',
  ghost: 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)]',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  gradient: 'text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-xs gap-1 rounded-md',
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  md: 'h-8 px-3 text-sm gap-2 rounded-lg',
  lg: 'h-10 px-4 text-sm gap-2 rounded-xl',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  loading,
  active,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isGradient = variant === 'gradient';

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.1 }}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150 select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        active && variant === 'ghost' && 'bg-[rgba(124,58,237,0.15)] text-[var(--accent-primary)]',
        isGradient && 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]',
        className
      )}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </motion.button>
  );
}

// Icon-only button
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip?: string;
  active?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function IconButton({ icon, tooltip, active, size = 'md', variant = 'ghost', className, ...props }: IconButtonProps) {
  const sizeMap: Record<ButtonSize, string> = {
    xs: 'w-6 h-6 rounded',
    sm: 'w-7 h-7 rounded-md',
    md: 'w-8 h-8 rounded-lg',
    lg: 'w-10 h-10 rounded-xl',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.1 }}
      title={tooltip}
      aria-label={tooltip}
      className={clsx(
        'inline-flex items-center justify-center transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeMap[size],
        active && 'bg-[rgba(124,58,237,0.2)] text-[var(--accent-primary)]',
        className
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {icon}
    </motion.button>
  );
}
