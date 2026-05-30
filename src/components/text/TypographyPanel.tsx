'use client';

import React, { useCallback, useEffect } from 'react';
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough,
  ArrowLeftRight,
} from 'lucide-react';
import { useToolStore } from '@/store/toolStore';
import { useCanvasStore } from '@/store/canvasStore';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { FontPicker } from '@/components/fonts/FontPicker';
import { SectionHeader } from '@/components/ui/Panel';
import { IconButton } from '@/components/ui/Button';
import { TextEffectsPanel } from './TextEffectsPanel';
import { clsx } from 'clsx';

export function TypographyPanel() {
  const { textSettings, updateTextSettings } = useToolStore();
  const { fabricCanvas, selectedIds } = useCanvasStore();

  // Sync settings to selected Fabric.js text object
  const applyToCanvas = useCallback(
    (updates: Partial<typeof textSettings>) => {
      if (!fabricCanvas || selectedIds.length === 0) return;
      const obj = fabricCanvas.getActiveObject();
      if (!obj || obj.type !== 'i-text') return;

      const fabricUpdates: Record<string, unknown> = {};

      if (updates.fontFamily !== undefined) fabricUpdates.fontFamily = updates.fontFamily;
      if (updates.fontSize !== undefined) fabricUpdates.fontSize = updates.fontSize;
      if (updates.lineHeight !== undefined) fabricUpdates.lineHeight = updates.lineHeight;
      if (updates.letterSpacing !== undefined) fabricUpdates.charSpacing = updates.letterSpacing * 10;
      if (updates.textAlign !== undefined) fabricUpdates.textAlign = updates.textAlign;
      if (updates.color !== undefined) fabricUpdates.fill = updates.color;
      if (updates.opacity !== undefined) fabricUpdates.opacity = updates.opacity / 100;
      if (updates.fontStyle !== undefined) {
        fabricUpdates.fontWeight = updates.fontStyle.includes('bold') ? 'bold' : 'normal';
        fabricUpdates.fontStyle = updates.fontStyle.includes('italic') ? 'italic' : 'normal';
      }
      if (updates.textDecoration !== undefined) {
        fabricUpdates.underline = updates.textDecoration === 'underline';
        fabricUpdates.linethrough = updates.textDecoration === 'line-through';
        fabricUpdates.overline = updates.textDecoration === 'overline';
      }

      obj.set(fabricUpdates);
      fabricCanvas.renderAll();
    },
    [fabricCanvas, selectedIds]
  );

  const handleUpdate = useCallback(
    (updates: Partial<typeof textSettings>) => {
      updateTextSettings(updates);
      applyToCanvas(updates);
    },
    [updateTextSettings, applyToCanvas]
  );

  // Sync from selected object when selection changes
  useEffect(() => {
    if (!fabricCanvas || selectedIds.length === 0) return;
    const obj = fabricCanvas.getActiveObject();
    if (!obj || obj.type !== 'i-text') return;

    updateTextSettings({
      fontFamily: obj.fontFamily ?? 'Inter',
      fontSize: obj.fontSize ?? 48,
      lineHeight: obj.lineHeight ?? 1.2,
      letterSpacing: (obj.charSpacing ?? 0) / 10,
      textAlign: obj.textAlign ?? 'left',
      color: obj.fill as string ?? '#ffffff',
      opacity: Math.round((obj.opacity ?? 1) * 100),
      fontStyle: [
        obj.fontWeight === 'bold' ? 'bold' : '',
        obj.fontStyle === 'italic' ? 'italic' : '',
      ].filter(Boolean).join(' ') || 'normal',
    });
  }, [selectedIds, fabricCanvas, updateTextSettings]);

  const isBold = textSettings.fontStyle.includes('bold');
  const isItalic = textSettings.fontStyle.includes('italic');

  const toggleBold = () => {
    const newStyle = isBold
      ? textSettings.fontStyle.replace('bold', '').trim() || 'normal'
      : `bold ${textSettings.fontStyle}`.trim();
    handleUpdate({ fontStyle: newStyle });
  };

  const toggleItalic = () => {
    const newStyle = isItalic
      ? textSettings.fontStyle.replace('italic', '').trim() || 'normal'
      : `${textSettings.fontStyle} italic`.trim();
    handleUpdate({ fontStyle: newStyle });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <SectionHeader title="Typography" />

      {/* Font Family */}
      <div className="p-3 border-b border-[var(--border)] space-y-2">
        <label className="text-xs text-[var(--text-muted)]">Font Family</label>
        <FontPicker
          value={textSettings.fontFamily}
          onChange={(family) => handleUpdate({ fontFamily: family })}
        />
      </div>

      {/* Style buttons */}
      <div className="p-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-1 flex-wrap">
          <IconButton
            icon={<Bold size={14} />}
            tooltip="Bold"
            active={isBold}
            onClick={toggleBold}
            size="sm"
          />
          <IconButton
            icon={<Italic size={14} />}
            tooltip="Italic"
            active={isItalic}
            onClick={toggleItalic}
            size="sm"
          />
          <IconButton
            icon={<Underline size={14} />}
            tooltip="Underline"
            active={textSettings.textDecoration === 'underline'}
            onClick={() => handleUpdate({ textDecoration: textSettings.textDecoration === 'underline' ? 'none' : 'underline' })}
            size="sm"
          />
          <IconButton
            icon={<Strikethrough size={14} />}
            tooltip="Strikethrough"
            active={textSettings.textDecoration === 'line-through'}
            onClick={() => handleUpdate({ textDecoration: textSettings.textDecoration === 'line-through' ? 'none' : 'line-through' })}
            size="sm"
          />
          <div className="w-px h-5 bg-[var(--border)] mx-0.5" />
          {/* Text direction */}
          <IconButton
            icon={<ArrowLeftRight size={14} />}
            tooltip={`Direction: ${textSettings.textDirection.toUpperCase()}`}
            active={textSettings.textDirection === 'rtl'}
            onClick={() => handleUpdate({ textDirection: textSettings.textDirection === 'ltr' ? 'rtl' : 'ltr' })}
            size="sm"
          />
        </div>
      </div>

      {/* Text Align */}
      <div className="p-3 border-b border-[var(--border)]">
        <label className="text-xs text-[var(--text-muted)] block mb-2">Alignment</label>
        <div className="flex items-center gap-1">
          {[
            { value: 'left', icon: <AlignLeft size={14} /> },
            { value: 'center', icon: <AlignCenter size={14} /> },
            { value: 'right', icon: <AlignRight size={14} /> },
            { value: 'justify', icon: <AlignJustify size={14} /> },
          ].map(({ value, icon }) => (
            <IconButton
              key={value}
              icon={icon}
              tooltip={`Align ${value}`}
              active={textSettings.textAlign === value}
              onClick={() => handleUpdate({ textAlign: value as typeof textSettings.textAlign })}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Size & Spacing */}
      <div className="p-3 border-b border-[var(--border)] space-y-3">
        <Slider
          label="Font Size"
          value={textSettings.fontSize}
          min={6}
          max={500}
          step={1}
          unit="px"
          onChange={(v) => handleUpdate({ fontSize: v })}
        />
        <Slider
          label="Line Height"
          value={textSettings.lineHeight}
          min={0.5}
          max={4}
          step={0.05}
          decimals={2}
          onChange={(v) => handleUpdate({ lineHeight: v })}
        />
        <Slider
          label="Letter Spacing"
          value={textSettings.letterSpacing}
          min={-10}
          max={50}
          step={0.5}
          unit="px"
          decimals={1}
          onChange={(v) => handleUpdate({ letterSpacing: v })}
        />
        <Slider
          label="Word Spacing"
          value={textSettings.wordSpacing}
          min={-10}
          max={100}
          step={1}
          unit="px"
          onChange={(v) => handleUpdate({ wordSpacing: v })}
        />
      </div>

      {/* Color & Opacity */}
      <div className="p-3 border-b border-[var(--border)] space-y-3">
        <ColorPicker
          label="Color"
          color={textSettings.color}
          onChange={(c) => handleUpdate({ color: c })}
        />
        <Slider
          label="Opacity"
          value={textSettings.opacity}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(v) => handleUpdate({ opacity: v })}
        />
      </div>

      {/* Transform */}
      <div className="p-3 border-b border-[var(--border)]">
        <label className="text-xs text-[var(--text-muted)] block mb-2">Transform</label>
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { value: 'none', label: 'Aa' },
            { value: 'uppercase', label: 'AA' },
            { value: 'lowercase', label: 'aa' },
            { value: 'capitalize', label: 'Aa+' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleUpdate({ textTransform: value as typeof textSettings.textTransform })}
              className={clsx(
                'px-2.5 py-1 text-xs rounded-md border transition-colors',
                textSettings.textTransform === value
                  ? 'border-[var(--accent-primary)] bg-[rgba(124,58,237,0.15)] text-[var(--accent-primary)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Effects */}
      <TextEffectsPanel />
    </div>
  );
}
