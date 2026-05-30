'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MousePointer2, Type, ImagePlus, Square, Hand,
  Layers, Type as FontIcon, Package, History, Plus,
} from 'lucide-react';
import { useToolStore, type ActiveTool } from '@/store/toolStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useProjectStore } from '@/store/projectStore';
import { addTextToCanvas, addImageToCanvas, serializeCanvas } from '@/lib/canvas/fabricSetup';
import { clsx } from 'clsx';
import * as Tooltip from '@radix-ui/react-tooltip';

const tools = [
  { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select',  shortcut: 'V' },
  { id: 'text',   icon: <Type size={18} />,          label: 'Text',    shortcut: 'T' },
  { id: 'image',  icon: <ImagePlus size={18} />,     label: 'Image',   shortcut: 'I' },
  { id: 'shape',  icon: <Square size={18} />,        label: 'Shape' },
  { id: 'pan',    icon: <Hand size={18} />,          label: 'Pan',     shortcut: 'Space' },
];

const panels = [
  { id: 'layers',  icon: <Layers size={18} />,   label: 'Layers' },
  { id: 'fonts',   icon: <FontIcon size={18} />, label: 'Fonts' },
  { id: 'assets',  icon: <Package size={18} />,  label: 'Assets' },
  { id: 'history', icon: <History size={18} />,  label: 'History' },
];

interface LeftToolbarProps {
  activePanel: string | null;
  onPanelToggle: (panel: string) => void;
}

export function LeftToolbar({ activePanel, onPanelToggle }: LeftToolbarProps) {
  const { activeTool, setActiveTool, textSettings } = useToolStore();
  const { fabricCanvas, addObject, pushHistory } = useCanvasStore();
  const { setDirty } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = async () => {
    if (!fabricCanvas) { setActiveTool('text'); return; }
    const obj = await addTextToCanvas(fabricCanvas, 'Double-click to edit', {
      left: fabricCanvas.width / 2,
      top: fabricCanvas.height / 2,
      originX: 'center', originY: 'center',
      fontFamily: textSettings.fontFamily,
      fontSize: textSettings.fontSize,
      fill: '#1a1a2e',
    });
    addObject({ id: String(obj.get('id')), type: 'text', name: 'Text Layer', visible: true, locked: false, opacity: 100, blendMode: 'normal' });
    pushHistory('Add text', serializeCanvas(fabricCanvas));
    setDirty(true);
    setActiveTool('select');
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || !fabricCanvas) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const img = await addImageToCanvas(fabricCanvas, file);
        addObject({ id: String(img.get('id')), type: 'image', name: file.name, visible: true, locked: false, opacity: 100, blendMode: 'normal' });
      } catch { /* ignore */ }
    }
    pushHistory('Add image', serializeCanvas(fabricCanvas));
    setDirty(true);
    setActiveTool('select');
  };

  const handleToolClick = (id: string) => {
    if (id === 'image') { fileInputRef.current?.click(); }
    else { setActiveTool(id as ActiveTool); }
  };

  return (
    <Tooltip.Provider delayDuration={400}>
      <div className="flex flex-col items-center gap-1 py-3 px-1.5 glass-strong border-r border-[var(--border)] shrink-0 overflow-y-auto" style={{ width: 56 }}>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => { handleImageFiles(e.target.files); e.target.value = ''; }} />

        {/* Quick-add text */}
        <Tip label="Add Text (click canvas with T tool)">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleAddText}
            className="w-full flex items-center justify-center h-9 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)] mb-1"
            aria-label="Add Text">
            <Plus size={16} />
          </motion.button>
        </Tip>

        <div className="w-8 h-px bg-[var(--border)] mb-1" />

        {/* Tools */}
        {tools.map(t => (
          <Tip key={t.id} label={t.label} shortcut={t.shortcut}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleToolClick(t.id)}
              className={clsx('w-full flex items-center justify-center h-9 rounded-lg transition-all duration-150',
                activeTool === t.id
                  ? 'bg-[rgba(124,58,237,0.2)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-panel-hover)] hover:text-[var(--text-primary)]'
              )}
              aria-label={t.label} aria-pressed={activeTool === t.id}>
              {t.icon}
            </motion.button>
          </Tip>
        ))}

        <div className="w-8 h-px bg-[var(--border)] my-1" />

        {/* Panel toggles */}
        {panels.map(p => (
          <Tip key={p.id} label={p.label}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onPanelToggle(p.id)}
              className={clsx('w-full flex items-center justify-center h-9 rounded-lg transition-all duration-150',
                activePanel === p.id
                  ? 'bg-[rgba(124,58,237,0.2)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-panel-hover)] hover:text-[var(--text-primary)]'
              )}
              aria-label={p.label} aria-pressed={activePanel === p.id}>
              {p.icon}
            </motion.button>
          </Tip>
        ))}
      </div>
    </Tooltip.Provider>
  );
}

function Tip({ label, shortcut, children }: { label: string; shortcut?: string; children: React.ReactNode }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="right" sideOffset={8}
          className="glass px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-primary)] shadow-xl z-[9999] flex items-center gap-2">
          {label}
          {shortcut && <kbd className="text-[10px] bg-[var(--bg-panel)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">{shortcut}</kbd>}
          <Tooltip.Arrow className="fill-[rgba(19,19,26,0.9)]" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
