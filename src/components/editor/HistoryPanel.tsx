'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import { SectionHeader } from '@/components/ui/Panel';
import { clsx } from 'clsx';

export function HistoryPanel() {
  const { history, historyIndex, jumpToHistory, fabricCanvas } = useCanvasStore();

  const handleJump = (index: number) => {
    if (!fabricCanvas || index === historyIndex) return;
    const entry = history[index];
    fabricCanvas.loadFromJSON(JSON.parse(entry.canvasJSON), () => {
      fabricCanvas.renderAll();
    });
    jumpToHistory(index);
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="History" />

      {history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-[var(--text-muted)] text-center">
            No history yet.<br />Start editing to see history.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-1">
          {[...history].reverse().map((entry, reversedIndex) => {
            const index = history.length - 1 - reversedIndex;
            const isCurrent = index === historyIndex;
            const isFuture = index > historyIndex;

            return (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reversedIndex * 0.02 }}
                onClick={() => handleJump(index)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors',
                  isCurrent
                    ? 'bg-[rgba(124,58,237,0.15)] border-l-2 border-[var(--accent-primary)]'
                    : isFuture
                    ? 'opacity-40 hover:opacity-60 border-l-2 border-transparent'
                    : 'hover:bg-[var(--bg-panel-hover)] border-l-2 border-transparent'
                )}
              >
                <Clock size={12} className={clsx(
                  isCurrent ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
                )} />
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    'text-xs truncate',
                    isCurrent ? 'text-[var(--accent-primary)] font-medium' : 'text-[var(--text-primary)]'
                  )}>
                    {entry.label}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {isCurrent && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
