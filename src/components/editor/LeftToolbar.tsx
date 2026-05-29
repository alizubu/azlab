'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MousePointer2, Type, Image, Square, Crop, Hand,
  Layers, Type as FontIcon, Package, History, Pipette,
} from 'lucide-react';
import { useToolStore, type ActiveTool } from '@/store/toolStore';
import { clsx } from 'clsx';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ToolItem {
  id: ActiveTool | string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  isPanel?: boolean;
}

const tools: ToolItem[] = [
  { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select', shortcut: 'V' },
  { id: 'text', icon: <Type size={18} />, label: 'Text', shortcut: 'T' },
  { id: 'image', icon: <Image size={18} />, label: 'Image', shortcut: 'I' },
  { id: 'shape', icon: <Square size={18} />, label: 'Shape' },
  { id: 'crop', icon: <Crop size={18} />, label: 'Crop' },
  { id: 'pan', icon: <Hand size={18} />, label: 'Pan', shortcut: 'Space' },
  { id: 'eyedropper', icon: <Pipette size={18} />, label: 'Eyedropper' },
];

const panels: ToolItem[] = [
  { id: 'layers', icon: <Layers size={18} />, label: 'Layers', isPanel: true },
  { id: 'fonts', icon: <FontIcon size={18} />, label: 'Fonts', isPanel: true },
  { id: 'assets', icon: <Package size={18} />, label: 'Assets', isPanel: true },
  { id: 'history', icon: <History size={18} />, label: 'History', isPanel: true },
];

interface LeftToolbarProps {
  activePanel: string | null;
  onPanelToggle: (panel: string) => void;
}

export function LeftToolbar({ activePanel, onPanelToggle }: LeftToolbarProps) {
  const { activeTool, setActiveTool } = useToolStore();

  return (
    <Tooltip.Provider delayDuration={400}>
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-1 py-3 px-1.5 glass-strong border-r border-[var(--border)] w-14 shrink-0 z-20"
      >
        {/* Tools */}
        <div className="flex flex-col gap-1 w-full">
          {tools.map((tool) => (
            <ToolButton
              key={tool.id}
              tool={tool}
              active={activeTool === tool.id}
              onClick={() => setActiveTool(tool.id as ActiveTool)}
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

function ToolButton({
  tool,
  active,
  onClick,
}: {
  tool: ToolItem;
  active: boolean;
  onClick: () => void;
}) {
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
        <Tooltip.Content
          side="right"
          className="glass px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-primary)] shadow-xl z-[9999]"
          sideOffset={8}
        >
          <div className="flex items-center gap-2">
            <span>{tool.label}</span>
            {tool.shortcut && (
              <kbd className="text-[10px] bg-[var(--bg-panel)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">
                {tool.shortcut}
              </kbd>
            )}
          </div>
          <Tooltip.Arrow className="fill-[rgba(19,19,26,0.9)]" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
