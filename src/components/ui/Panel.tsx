'use client';

import React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export function Panel({ children, className, glass = true }: PanelProps) {
  return (
    <div
      className={clsx(
        'rounded-xl',
        glass ? 'glass' : 'bg-[var(--bg-surface)]',
        className
      )}
    >
      {children}
    </div>
  );
}

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function AccordionSection({
  title,
  children,
  defaultOpen = false,
  badge,
  action,
  className,
}: AccordionSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={clsx('border-b border-[var(--border)] last:border-0', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--bg-panel-hover)] transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--text-primary)]">{title}</span>
          {badge}
        </div>
        <div className="flex items-center gap-1">
          {action && <span onClick={(e) => e.stopPropagation()}>{action}</span>}
          <ChevronDown
            size={14}
            className={clsx(
              'text-[var(--text-muted)] transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-2.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{title}</span>
      {action}
    </div>
  );
}
