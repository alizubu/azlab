'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToolStore } from '@/store/toolStore';
import { useCanvasStore } from '@/store/canvasStore';
import { TypographyPanel } from '@/components/text/TypographyPanel';
import { ImageAdjustPanel } from './ImageAdjustPanel';

const PANEL_WIDTH = 260;

export function RightPanel() {
  const { activeTool } = useToolStore();
  const { selectedIds, fabricCanvas } = useCanvasStore();

  // Safely get selected object type
  let selectedType: string | null = null;
  if (selectedIds.length > 0 && fabricCanvas) {
    try {
      const obj = fabricCanvas.getActiveObject?.();
      selectedType = obj?.type ?? null;
    } catch { /* ignore */ }
  }

  const showTypography = activeTool === 'text' || selectedType === 'i-text';
  const showImagePanel = selectedType === 'image';
  const showPanel      = showTypography || showImagePanel;

  return (
    <AnimatePresence>
      {showPanel && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: PANEL_WIDTH, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col h-full glass-strong border-l border-[var(--border)] overflow-hidden shrink-0 z-10"
          style={{ width: PANEL_WIDTH }}
        >
          {showTypography && <TypographyPanel />}
          {showImagePanel && <ImageAdjustPanel />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
