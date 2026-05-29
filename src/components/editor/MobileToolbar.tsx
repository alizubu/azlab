'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MousePointer2, Type, Image, Layers, Download,
  Undo2, Redo2, Sliders, ChevronUp,
} from 'lucide-react';
import { useToolStore, type ActiveTool } from '@/store/toolStore';
import { useCanvasStore } from '@/store/canvasStore';
import { clsx } from 'clsx';

interface MobileToolbarProps {
  onExport: () => void;
  onLayersToggle: () => void;
  onPropertiesToggle: () => void;
}

export function MobileToolbar({ onExport, onLayersToggle, onPropertiesToggle }: MobileToolbarProps) {
  const { activeTool, setActiveTool } = useToolStore();
  const { history, historyIndex, fabricCanvas, jumpToHistory } = useCanvasStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (!fabricCanvas || !canUndo) return;
    const entry = history[historyIndex - 1];
    fabricCanvas.loadFromJSON(JSON.parse(entry.canvasJSON), () => fabricCanvas.renderAll());
    jumpToHistory(historyIndex - 1);
  };

  const handleRedo = () => {
    if (!fabricCanvas || !canRedo) return;
    const entry = history[historyIndex + 1];
    fabricCanvas.loadFromJSON(JSON.parse(entry.canvasJSON), () => fabricCanvas.renderAll());
    jumpToHistory(historyIndex + 1);
  };

  const tools: { id: ActiveTool; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer2 size={20} />, label: 'Select' },
    { id: 'text', icon: <Type size={20} />, label: 'Text' },
    { id: 'image', icon: <Image size={20} />, label: 'Image' },
  ];

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-[var(--border)] px-4 py-3 safe-area-bottom"
    >
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="tool-btn disabled:opacity-30"
            aria-label="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="tool-btn disabled:opacity-30"
            aria-label="Redo"
          >
            <Redo2 size={18} />
          </button>
        </div>

        {/* Tools */}
        <div className="flex gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={clsx(
                'tool-btn w-10 h-10',
                activeTool === tool.id && 'active'
              )}
              aria-label={tool.label}
              aria-pressed={activeTool === tool.id}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Panels + Export */}
        <div className="flex gap-1">
          <button onClick={onLayersToggle} className="tool-btn w-10 h-10" aria-label="Layers">
            <Layers size={18} />
          </button>
          <button onClick={onPropertiesToggle} className="tool-btn w-10 h-10" aria-label="Properties">
            <Sliders size={18} />
          </button>
          <button
            onClick={onExport}
            className="tool-btn w-10 h-10 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl"
            aria-label="Export"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
