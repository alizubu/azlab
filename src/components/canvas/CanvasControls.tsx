'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ZoomIn, ZoomOut, Maximize2, Grid3X3, Ruler, Magnet,
} from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import { IconButton } from '@/components/ui/Button';

interface CanvasControlsProps {
  onFitToScreen: () => void;
}

export function CanvasControls({ onFitToScreen }: CanvasControlsProps) {
  const { zoom, setZoom, showGrid, toggleGrid, showRulers, toggleRulers, snapEnabled, toggleSnap } = useCanvasStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-12 right-4 flex flex-col gap-1 glass rounded-xl p-1.5 z-30"
    >
      <IconButton
        icon={<ZoomIn size={14} />}
        tooltip="Zoom In (Ctrl++)"
        onClick={() => setZoom(zoom * 1.2)}
        size="sm"
      />
      <div className="text-center text-xs text-[var(--text-muted)] py-0.5 select-none">
        {Math.round(zoom * 100)}%
      </div>
      <IconButton
        icon={<ZoomOut size={14} />}
        tooltip="Zoom Out (Ctrl+-)"
        onClick={() => setZoom(zoom / 1.2)}
        size="sm"
      />
      <div className="w-full h-px bg-[var(--border)] my-0.5" />
      <IconButton
        icon={<Maximize2 size={14} />}
        tooltip="Fit to Screen (Ctrl+0)"
        onClick={onFitToScreen}
        size="sm"
      />
      <div className="w-full h-px bg-[var(--border)] my-0.5" />
      <IconButton
        icon={<Grid3X3 size={14} />}
        tooltip="Toggle Grid"
        onClick={toggleGrid}
        active={showGrid}
        size="sm"
      />
      <IconButton
        icon={<Ruler size={14} />}
        tooltip="Toggle Rulers"
        onClick={toggleRulers}
        active={showRulers}
        size="sm"
      />
      <IconButton
        icon={<Magnet size={14} />}
        tooltip="Toggle Snap"
        onClick={toggleSnap}
        active={snapEnabled}
        size="sm"
      />
    </motion.div>
  );
}
