'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useCanvasStore, type CanvasSize } from '@/store/canvasStore';
import { CANVAS_PRESETS } from '@/store/projectStore';
import { resizeFabricCanvas } from '@/lib/canvas/fabricSetup';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';

interface CanvasSizeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CanvasSizeDialog({ open, onClose }: CanvasSizeDialogProps) {
  const { canvasSize, setCanvasSize, fabricCanvas } = useCanvasStore();
  const [width, setWidth] = useState(canvasSize.width);
  const [height, setHeight] = useState(canvasSize.height);
  const [unit, setUnit] = useState<CanvasSize['unit']>(canvasSize.unit);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleApply = () => {
    setCanvasSize({ width, height, unit });
    if (fabricCanvas) {
      resizeFabricCanvas(fabricCanvas, width, height);
    }
    onClose();
  };

  const handlePreset = (preset: typeof CANVAS_PRESETS[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setUnit(preset.unit);
    setActivePreset(preset.id);
  };

  const categories = [...new Set(CANVAS_PRESETS.map((p) => p.category))];
  const [activeCategory, setActiveCategory] = useState('Social');

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-lg"
          aria-describedby="canvas-size-desc"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <Dialog.Title className="text-sm font-semibold text-[var(--text-primary)]">
                Canvas Size
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-5 space-y-4" id="canvas-size-desc">
              {/* Custom dimensions */}
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-[var(--text-muted)]">Width</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => { setWidth(parseInt(e.target.value) || 1); setActivePreset(null); }}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
                <span className="text-[var(--text-muted)] mt-5">×</span>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-[var(--text-muted)]">Height</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => { setHeight(parseInt(e.target.value) || 1); setActivePreset(null); }}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-muted)]">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as CanvasSize['unit'])}
                    className="px-2 py-2 text-sm bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                  >
                    <option value="px">px</option>
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                  </select>
                </div>
              </div>

              {/* Preset categories */}
              <div className="flex gap-1.5 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={clsx(
                      'px-2.5 py-1 text-xs rounded-full border transition-colors',
                      activeCategory === cat
                        ? 'border-[var(--accent-primary)] bg-[rgba(124,58,237,0.15)] text-[var(--accent-primary)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {CANVAS_PRESETS.filter((p) => p.category === activeCategory).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePreset(preset)}
                    className={clsx(
                      'p-2.5 rounded-lg border text-left transition-colors',
                      activePreset === preset.id
                        ? 'border-[var(--accent-primary)] bg-[rgba(124,58,237,0.1)]'
                        : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                    )}
                  >
                    <p className="text-xs font-medium text-[var(--text-primary)]">{preset.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{preset.width}×{preset.height}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--border)]">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button variant="gradient" onClick={handleApply}>Apply</Button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
