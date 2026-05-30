'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useCanvasStore } from '@/store/canvasStore';
import { useProjectStore } from '@/store/projectStore';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';
import { toast } from 'sonner';

type ExportFormat = 'png' | 'jpeg' | 'webp';
type ExportScale = 1 | 2 | 3 | 4;

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExportModal({ open, onClose }: ExportModalProps) {
  const { fabricCanvas, canvasSize } = useCanvasStore();
  const { currentProject } = useProjectStore();

  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState<ExportScale>(2);
  const [quality, setQuality] = useState(92);
  const [filename, setFilename] = useState(currentProject?.name ?? 'design');
  const [customWidth, setCustomWidth] = useState(canvasSize.width);
  const [customHeight, setCustomHeight] = useState(canvasSize.height);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [exporting, setExporting] = useState(false);

  const outputWidth = useCustomSize ? customWidth : canvasSize.width * scale;
  const outputHeight = useCustomSize ? customHeight : canvasSize.height * scale;

  const handleExport = useCallback(async () => {
    if (!fabricCanvas) return;
    setExporting(true);

    try {
      const multiplier = useCustomSize
        ? customWidth / canvasSize.width
        : scale;

      const dataURL = fabricCanvas.toDataURL({
        format: format === 'png' ? 'png' : format,
        quality: quality / 100,
        multiplier,
      });

      // Download
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${filename}.${format}`;
      link.click();

      toast.success(`Exported as ${filename}.${format}`);
      onClose();
    } catch (err) {
      toast.error('Export failed. Please try again.');
      console.error(err);
    } finally {
      setExporting(false);
    }
  }, [fabricCanvas, format, quality, scale, filename, useCustomSize, customWidth, canvasSize, onClose]);

  const formatSizes: Record<ExportScale, string> = {
    1: `${canvasSize.width}×${canvasSize.height}`,
    2: `${canvasSize.width * 2}×${canvasSize.height * 2}`,
    3: `${canvasSize.width * 3}×${canvasSize.height * 3}`,
    4: `${canvasSize.width * 4}×${canvasSize.height * 4}`,
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md"
          aria-describedby="export-description"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="glass-strong rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <Dialog.Title className="text-sm font-semibold text-[var(--text-primary)]">
                Export Design
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-5 space-y-5" id="export-description">
              {/* Filename */}
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)]">Filename</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              {/* Format */}
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)]">Format</label>
                <div className="flex gap-2">
                  {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={clsx(
                        'flex-1 py-2 text-xs rounded-lg border font-medium uppercase transition-colors',
                        format === f
                          ? 'border-[var(--accent-primary)] bg-[rgba(124,58,237,0.15)] text-[var(--accent-primary)]'
                          : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                {format === 'png' && (
                  <p className="text-[10px] text-[var(--text-muted)]">Supports transparency (alpha channel)</p>
                )}
              </div>

              {/* Quality (for jpeg/webp) */}
              {format !== 'png' && (
                <Slider
                  label="Quality"
                  value={quality}
                  min={10}
                  max={100}
                  step={1}
                  unit="%"
                  onChange={setQuality}
                />
              )}

              {/* Scale */}
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--text-muted)]">Resolution Scale</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {([1, 2, 3, 4] as ExportScale[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setScale(s); setUseCustomSize(false); }}
                      className={clsx(
                        'py-2 text-xs rounded-lg border transition-colors',
                        scale === s && !useCustomSize
                          ? 'border-[var(--accent-primary)] bg-[rgba(124,58,237,0.15)] text-[var(--accent-primary)]'
                          : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                      )}
                    >
                      <div className="font-semibold">{s}×</div>
                      <div className="text-[9px] mt-0.5 opacity-70">{formatSizes[s]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom size */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomSize}
                    onChange={(e) => setUseCustomSize(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs text-[var(--text-muted)]">Custom dimensions</span>
                </label>
                {useCustomSize && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                      className="flex-1 px-2 py-1.5 text-xs bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      placeholder="Width"
                    />
                    <span className="text-xs text-[var(--text-muted)]">×</span>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                      className="flex-1 px-2 py-1.5 text-xs bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                      placeholder="Height"
                    />
                    <span className="text-xs text-[var(--text-muted)]">px</span>
                  </div>
                )}
              </div>

              {/* Output info */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)]">Output size</span>
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  {outputWidth} × {outputHeight} px
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--border)]">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button
                variant="gradient"
                icon={exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                onClick={handleExport}
                loading={exporting}
              >
                Export
              </Button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
