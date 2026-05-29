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

  // Determine what to show
  const selectedObj = selectedIds.length > 0 && fabricCanvas
    ? fabricCanvas.getActiveObject()
    : null;

  const showTypography = activeTool === 'text' || selectedObj?.type === 'i-text';
  const showImagePanel = selectedObj?.type === 'image';
  const showPanel = showTypography || showImagePanel;

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
