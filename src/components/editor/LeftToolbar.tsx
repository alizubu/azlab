'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MousePointer2, Type, ImagePlus, Square, Hand,
  Layers, Type as FontIcon, Package, History,
  Plus,
} from 'lucide-react';
import { useToolStore, type ActiveTool } from '@/store/toolStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useProjectStore } from '@/store/projectStore';
import { addTextToCanvas, addImageToCanvas, serializeCanvas } from '@/lib/canvas/fabricSetup';
import { clsx } from 'clsx';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ToolItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  isPanel?: boolean;
}

const tools: ToolItem[] = [
  { id: 'select',     icon: <MousePointer2 size={18} />, label: 'Select',    shortcut: 'V' },
  { id: 'text',       icon: <Type size={18} />,          label: 'Text',      shortcut: 'T' },
  { id: 'image',      icon: <ImagePlus size={18} />,     label: 'Image',     shortcut: 'I' },
  { id: 'shape',      icon: <Square size={18} />,        label: 'Shape' },
  { id: 'pan',        icon: <Hand size={18} />,          label: 'Pan',       shortcut: 'Space' },
];

const panels: ToolItem[] = [
  { id: 'layers',  icon: <Layers size={18} />,   label: 'Layers',  isPanel: true },
  { id: 'fonts',   icon: <FontIcon size={18} />, label: 'Fonts',   isPanel: true },
  { id: 'assets',  icon: <Package size={18} />,  label: 'Assets',  isPanel: true },
  { id: 'history', icon: <History size={18} />,  label: 'History', isPanel: true },
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

  // Quick-add text directly from toolbar button
  const handleAddText = async () => {
    if (!fabricCanvas) { setActiveTool('text'); return; }
    const obj = await addTextToCanvas(fabricCanvas, 'Double-click to edit', {
      left: fabricCanvas.width / 2,
      top: fabricCanvas.height / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: textSettings.fontFamily,
      fontSize: textSettings.fontSize,
      fill: '#1a1a2e',
    });
    addObject({
      id: obj.get('id') as string, type: 'text',
      name: 'Text Layer', visible: true, locked: false, opacity: 100, blendMode: 'normal',
    });
    pushHistory('Add text', serializeCanvas(fabricCanvas));
    setDirty(true);
    setActiveTool('select');
  };

  // Quick-add image from file picker
  const handleAddImage = async (files: FileList | null) => {
    if (!files || !fabricCanvas) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const img = await addImageToCanvas(fabricCanvas, file);
        addObject({
          id: img.get('id') as string, type: 'image',
          name: file.name, visible: true, locked: false, opacity: 100, blendMode: 'normal',
        });
      } catch { /* ignore */ }
    }
    pushHistory('Add image', serializeCanvas(fabricCanvas));
    setDirty(true);
    setActiveTool('select');
  };

  const handleToolClick = (id: string) => {
    if (id === 'text') {
      setActiveTool('text');
    } else if (id === 'image') {
      fileInputRef.current?.click();
    } else {
      setActiveTool(id as ActiveTool);
    }
  };

  return (
    <Tooltip.Provider delayDuration={400}>
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-1 py-3 px-1.5 glass-strong border-r border-[var(--border)] w-14 shrink-0 z-20"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { handleAddImage(e.target.files); e.target.value = ''; }}
        />

        {/* Quick-add buttons */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddText}
              className="w-full flex items-center justify-center h-9 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)] mb-1"
              aria-label="Add Text"
            >
              <Plus size={16} />
            </motion.button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="right" className="glass px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-primary)] shadow-xl z-[9999]" sideOffset={8}>
              Add Text <kbd className="ml-1 text-[10px] bg-[var(--bg-panel)] px-1 py-0.5 rounded">T</kbd>
              <Tooltip.Arrow className="fill-[rgba(19,19,26,0.9)]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <div className="w-8 h-px bg-[var(--border)] mb-1" />

        {/* Tools */}
        <div className="flex flex-col gap-1 w-full">
          {tools.map((tool) => (
            <ToolButton
              key={tool.id}
              tool={tool}
              active={activeTool === tool.id}
              onClick={() => handleToolClick(tool.id)}
            />
          ))}
        </div>

        <div className="w-8 h-px bg-[var(--border)] my-1" />

        {/* Panel toggles */}
        <div className="flex flex-col gap-1 w-full">
          {panels.map((panel) => (
            <ToolButton
              key={panel.id}
              tool={panel}
              active={activePanel === panel.id}
              onClick={() => onPanelToggle(panel.id)}
            />
          ))}
        </div>
      </motion.div>
    </Tooltip.Provider>
  );
}

function ToolButton({ tool, active, onClick }: { tool: ToolItem; active: boolean; onClick: () => void }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className={clsx(
            'w-full flex items-center justify-center h-9 rounded-lg transition-all duration-150',
            active
              ? 'bg-[rgba(124,58,237,0.2)] text-[var(--accent-primary)] shadow-[0_0_12px_rgba(124,58,237,0.2)]'
              : 'text-[var(--text-muted)] hover:bg-[var(--bg-panel-hover)] hover:text-[var(--text-primary)]'
          )}
          aria-label={tool.label}
          aria-pressed={active}
        >
          {tool.icon}
        </motion.button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="right" className="glass px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-primary)] shadow-xl z-[9999]" sideOffset={8}>
          <div className="flex items-center gap-2">
            <span>{tool.label}</span>
            {tool.shortcut && (
              <kbd className="text-[10px] bg-[var(--bg-panel)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">{tool.shortcut}</kbd>
            )}
          </div>
          <Tooltip.Arrow className="fill-[rgba(19,19,26,0.9)]" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
