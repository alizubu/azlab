'use client';

import React, { useState, useCallback } from 'react';
import { HexColorPicker, RgbaColorPicker } from 'react-colorful';
import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import tinycolor from 'tinycolor2';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
  showAlpha?: boolean;
}

export function ColorPicker({ color, onChange, label, className, showAlpha = true }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const tc = tinycolor(color);
  const rgba = tc.toRgb();
  const hex = tc.toHexString();
  const alpha = Math.round(tc.getAlpha() * 100);

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setHexInput(val);
      const parsed = tinycolor(val);
      if (parsed.isValid()) {
        onChange(parsed.toRgbString());
      }
    },
    [onChange]
  );

  const handleAlphaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const a = parseInt(e.target.value) / 100;
      const newColor = tinycolor(color).setAlpha(a).toRgbString();
      onChange(newColor);
    },
    [color, onChange]
  );

  const handleRgbaChange = useCallback(
    (rgba: { r: number; g: number; b: number; a: number }) => {
      onChange(tinycolor(rgba).toRgbString());
    },
    [onChange]
  );

  const presetColors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
    '#7c3aed', '#06b6d4', 'transparent',
  ];

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {label && <span className="text-xs text-[var(--text-muted)] shrink-0">{label}</span>}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="flex items-center gap-2 px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--bg-panel)] hover:border-[var(--border-strong)] transition-colors"
            aria-label="Open color picker"
          >
            <div
              className="w-5 h-5 rounded-sm border border-[rgba(255,255,255,0.15)] shrink-0"
              style={{
                background: color === 'transparent'
                  ? 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 0 0 / 8px 8px'
                  : color,
              }}
            />
            <span className="text-xs text-[var(--text-primary)] font-mono">{hex}</span>
            {showAlpha && (
              <span className="text-xs text-[var(--text-muted)]">{alpha}%</span>
            )}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="z-[9999] p-3 rounded-xl glass-strong shadow-xl w-56"
            sideOffset={8}
            align="start"
          >
            <div className="space-y-3">
              {/* Color picker */}
              {showAlpha ? (
                <RgbaColorPicker
                  color={rgba}
                  onChange={handleRgbaChange}
                  style={{ width: '100%', height: '160px' }}
                />
              ) : (
                <HexColorPicker
                  color={hex}
                  onChange={(h) => onChange(tinycolor(h).toRgbString())}
                  style={{ width: '100%', height: '160px' }}
                />
              )}

              {/* Hex input */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">HEX</span>
                <input
                  type="text"
                  value={isEditing ? hexInput : hex}
                  onFocus={() => { setIsEditing(true); setHexInput(hex); }}
                  onBlur={() => setIsEditing(false)}
                  onChange={handleHexInput}
                  className="flex-1 text-xs bg-[var(--bg-panel)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-primary)]"
                  maxLength={9}
                />
              </div>

              {/* Alpha slider */}
              {showAlpha && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)]">A</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={alpha}
                    onChange={handleAlphaChange}
                    className="flex-1"
                  />
                  <span className="text-xs text-[var(--text-muted)] w-8 text-right">{alpha}%</span>
                </div>
              )}

              {/* Preset swatches */}
              <div className="flex flex-wrap gap-1.5">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => onChange(c === 'transparent' ? 'transparent' : tinycolor(c).toRgbString())}
                    className="w-5 h-5 rounded-sm border border-[rgba(255,255,255,0.15)] hover:scale-110 transition-transform"
                    style={{
                      background: c === 'transparent'
                        ? 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 0 0 / 8px 8px'
                        : c,
                    }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
            <Popover.Arrow className="fill-[rgba(19,19,26,0.9)]" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
