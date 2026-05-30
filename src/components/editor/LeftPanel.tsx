'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LayersPanel } from '@/components/layers/LayersPanel';
import { FontLibrary } from '@/components/fonts/FontLibrary';
import { HistoryPanel } from './HistoryPanel';
import { AssetsPanel } from './AssetsPanel';
import { IconButton } from '@/components/ui/Button';

interface LeftPanelProps {
  activePanel: string | null;
  onClose: () => void;
}

export function LeftPanel({ activePanel, onClose }: LeftPanelProps) {
  return (
    <AnimatePresence>
      {activePanel && (
        <motion.div
          key={activePanel}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col glass-strong border-r border-[var(--border)] overflow-hidden shrink-0"
          style={{ width: 240, minHeight: 0 }}
        >
          {/* Close button */}
          <div className="absolute top-2 right-2 z-10">
            <IconButton icon={<X size={12} />} onClick={onClose} size="xs" tooltip="Close" />
          </div>

          <div className="flex flex-col h-full overflow-hidden">
            {activePanel === 'layers'  && <LayersPanel />}
            {activePanel === 'fonts'   && <FontLibrary />}
            {activePanel === 'history' && <HistoryPanel />}
            {activePanel === 'assets'  && <AssetsPanel />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
