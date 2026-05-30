'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Minus, Plus } from 'lucide-react';
import { useToolStore } from '@/store/toolStore';
import { useCanvasStore } from '@/store/canvasStore';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { clsx } from 'clsx';

/**
 * Floating text format toolbar — appears at the top of the canvas area
 * when the text tool is active or a text object is selected.
 * pointer-events: none on the wrapper so it never blocks canvas interaction.
 */
export function TextToolbar() {
  const { activeTool, textSettings, updateTextSettings } = useToolStore();
  const { selectedIds, fabricCanvas } = useCanvasStore();

  const isVisible =
    activeTool === 'text' ||
    (selectedIds.length > 0 && fabricCanvas?.getActiveObject()?.type === 'i-text');

  const applyToCanvas = useCallback((updates: Partial<typeof textSettings>) => {
    if (!fabricCanvas) return;
    const obj = fabricCanvas.getActiveObject();
    if (!obj || obj.type !== 'i-text') return;
    const u: Record<string, unknown> = {};
    if (updates.fontStyle !== undefined) {
      u.fontWeight = updates.fontStyle.includes('bold')   ? 'bold'   : 'normal';
      u.fontStyle  = updates.fontStyle.includes('italic') ? 'italic' : 'normal';
    }
    if (updates.textDecoration !== undefined) {
      u.underline   = updates.textDecoration === 'underline';
      u.linethrough = updates.textDecoration === 'line-through';
    }
    if (updates.textAlign !== undefined) u.textAlign = updates.textAlign;
    if (updates.fontSize  !== undefined) u.fontSize  = updates.fontSize;
    if (updates.color     !== undefined) u.fill      = updates.color;
    obj.set(u);
    fabricCanvas.renderAll();
  }, [fabricCanvas]);

  const handle = useCallback((updates: Partial<typeof textSettings>) => {
    updateTextSettings(updates);
    applyToCanvas(updates);
  }, [updateTextSettings, applyToCanvas]);

  const isBold   = textSettings.fontStyle.includes('bold');
  const isItalic = textSettings.fontStyle.includes('italic');

  return (
    // pointer-events: none on wrapper — the inner bar has pointer-events: auto
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 glass-strong rounded-xl shadow-xl border border-[var(--border)]"
          >
            {/* Font size */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => handle({ fontSize: Math.max(6, textSettings.fontSize - 2) })} className="tool-btn w-6 h-6" aria-label="Decrease size"><Minus size={11} /></button>
              <input
                type="number" value={textSettings.fontSize} min={6} max={500}
                onChange={e => handle({ fontSize: parseInt(e.target.value) || 12 })}
                className="w-10 text-center text-xs bg-[var(--bg-panel)] border border-[var(--border)] rounded px-1 py-0.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              <button onClick={() => handle({ fontSize: Math.min(500, textSettings.fontSize + 2) })} className="tool-btn w-6 h-6" aria-label="Increase size"><Plus size={11} /></button>
            </div>

            <div className="w-px h-5 bg-[var(--border)]" />

            {/* Bold / Italic / Underline */}
            <button onClick={() => handle({ fontStyle: isBold ? (textSettings.fontStyle.replace('bold','').trim()||'normal') : `bold ${textSettings.fontStyle}`.trim() })} className={clsx('tool-btn', isBold && 'active')} aria-label="Bold"><Bold size={13} /></button>
            <button onClick={() => handle({ fontStyle: isItalic ? (textSettings.fontStyle.replace('italic','').trim()||'normal') : `${textSettings.fontStyle} italic`.trim() })} className={clsx('tool-btn', isItalic && 'active')} aria-label="Italic"><Italic size={13} /></button>
            <button onClick={() => handle({ textDecoration: textSettings.textDecoration === 'underline' ? 'none' : 'underline' })} className={clsx('tool-btn', textSettings.textDecoration === 'underline' && 'active')} aria-label="Underline"><Underline size={13} /></button>

            <div className="w-px h-5 bg-[var(--border)]" />

            {/* Alignment */}
            {([['left',<AlignLeft size={13}/>],['center',<AlignCenter size={13}/>],['right',<AlignRight size={13}/>],['justify',<AlignJustify size={13}/>]] as const).map(([v, icon]) => (
              <button key={v} onClick={() => handle({ textAlign: v as typeof textSettings.textAlign })} className={clsx('tool-btn', textSettings.textAlign === v && 'active')} aria-label={`Align ${v}`}>{icon}</button>
            ))}

            <div className="w-px h-5 bg-[var(--border)]" />

            {/* Color */}
            <ColorPicker color={textSettings.color} onChange={c => handle({ color: c })} showAlpha={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
