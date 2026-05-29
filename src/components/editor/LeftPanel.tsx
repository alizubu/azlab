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

const PANEL_WIDTH = 240;

export function LeftPanel({ activePanel, onClose }: LeftPanelProps) {
  return (
    <AnimatePresence>
      {activePanel && (
        <motion.div
          key={activePanel}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: PANEL_WIDTH, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col h-full glass-strong border-r border-[var(--border)] overflow-hidden shrink-0 z-10"
          style={{ width: PANEL_WIDTH }}
        >
          <div className="flex flex-col h-full overflow-hidden relative">
            {/* Close button */}
            <div className="absolute top-2 right-2 z-10">
              <IconButton icon={<X size={12} />} onClick={onClose} size="xs" tooltip="Close panel" />
            </div>

            {activePanel === 'layers' && <LayersPanel />}
            {activePanel === 'fonts' && <FontLibrary />}
            {activePanel === 'history' && <HistoryPanel />}
            {activePanel === 'assets' && <AssetsPanel />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
