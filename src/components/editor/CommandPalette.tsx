'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Type, Image as ImageIcon, Download, Save, Grid3X3, Ruler, Zap } from 'lucide-react';
import { useToolStore } from '@/store/toolStore';
import { useCanvasStore } from '@/store/canvasStore';
import { clsx } from 'clsx';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onExport: () => void;
  onSave: () => void;
}

export function CommandPalette({ open, onClose, onExport, onSave }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevQuery, setPrevQuery] = useState(query);

  if (query !== prevQuery) {
    setSelectedIndex(0);
    setPrevQuery(query);
  }

  const { setActiveTool } = useToolStore();
  const { toggleGrid, toggleRulers } = useCanvasStore();

  const commands: Command[] = [
    { id: 'text', label: 'Text Tool', description: 'Add text to canvas', icon: <Type size={14} />, shortcut: 'T', action: () => { setActiveTool('text'); onClose(); }, category: 'Tools' },
    { id: 'select', label: 'Select Tool', description: 'Select and move objects', icon: <Zap size={14} />, shortcut: 'V', action: () => { setActiveTool('select'); onClose(); }, category: 'Tools' },
    { id: 'image', label: 'Image Tool', description: 'Upload an image', icon: <ImageIcon size={14} />, shortcut: 'I', action: () => { setActiveTool('image'); onClose(); }, category: 'Tools' },
    { id: 'export', label: 'Export Design', description: 'Export as PNG, JPG, or WebP', icon: <Download size={14} />, shortcut: 'Ctrl+E', action: () => { onExport(); onClose(); }, category: 'File' },
    { id: 'save', label: 'Save Project', description: 'Save current project', icon: <Save size={14} />, shortcut: 'Ctrl+S', action: () => { onSave(); onClose(); }, category: 'File' },
    { id: 'grid', label: 'Toggle Grid', description: 'Show/hide grid overlay', icon: <Grid3X3 size={14} />, action: () => { toggleGrid(); onClose(); }, category: 'View' },
    { id: 'rulers', label: 'Toggle Rulers', description: 'Show/hide rulers', icon: <Ruler size={14} />, action: () => { toggleRulers(); onClose(); }, category: 'View' },
  ];

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [filtered, selectedIndex, onClose]
  );

  // Group by category
  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 z-[9999] w-full max-w-lg"
          >
            <div className="glass-strong rounded-2xl shadow-2xl overflow-hidden">
              <div className="relative h-1 w-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]" />
              
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
                <Search size={16} className="text-[var(--text-muted)] shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Type a command..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                <kbd className="text-[10px] bg-[var(--bg-panel)] px-1.5 py-0.5 rounded text-[var(--text-muted)] border border-[var(--border)]">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-1 scrollbar-custom">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="w-12 h-12 bg-[var(--bg-panel)] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search size={20} className="text-[var(--text-muted)]" />
                    </div>
                    <p className="text-sm text-[var(--text-primary)]">No commands found</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Try searching for something else</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, cmds]) => (
                    <div key={category}>
                      <div className="px-4 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-[rgba(255,255,255,0.02)]">
                        {category}
                      </div>
                      {cmds.map((cmd) => {
                        const globalIndex = filtered.indexOf(cmd);
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={clsx(
                              'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all relative group',
                              globalIndex === selectedIndex
                                ? 'bg-[rgba(124,58,237,0.15)] text-[var(--accent-primary)]'
                                : 'hover:bg-[var(--bg-panel-hover)]'
                            )}
                          >
                            {globalIndex === selectedIndex && (
                              <motion.div
                                layoutId="active-indicator"
                                className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--accent-primary)]"
                              />
                            )}
                            <span className={clsx(
                              'shrink-0 p-1.5 rounded-md transition-colors',
                              globalIndex === selectedIndex 
                                ? 'bg-[var(--accent-primary)] text-white' 
                                : 'bg-[var(--bg-panel)] text-[var(--text-muted)]'
                            )}>
                              {cmd.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--text-primary)]">{cmd.label}</p>
                              {cmd.description && (
                                <p className="text-[10px] text-[var(--text-muted)] truncate group-hover:text-[var(--text-primary)]/70 transition-colors">
                                  {cmd.description}
                                </p>
                              )}
                            </div>
                            {cmd.shortcut && (
                              <div className="flex gap-1 shrink-0">
                                {cmd.shortcut.split('+').map((key, i) => (
                                  <kbd key={i} className="text-[9px] bg-[var(--bg-panel)] px-1.5 py-0.5 rounded text-[var(--text-muted)] border border-[var(--border)] uppercase font-sans">
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[var(--border)] bg-[rgba(0,0,0,0.2)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                    <kbd className="bg-[var(--bg-panel)] px-1 rounded border border-[var(--border)]">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                    <kbd className="bg-[var(--bg-panel)] px-1 rounded border border-[var(--border)]">↵</kbd>
                    <span>Select</span>
                  </div>
                </div>
                <div className="text-[10px] text-[var(--accent-primary)] font-medium">
                  AZLab Pro
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
