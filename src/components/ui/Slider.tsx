'use client';

import React, { useCallback } from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import { clsx } from 'clsx';

interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
  showInput?: boolean;
  decimals?: number;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  className,
  showInput = true,
  decimals = 0,
}: SliderProps) {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v)) {
        onChange(Math.max(min, Math.min(max, v)));
      }
    },
    [min, max, onChange]
  );

  const displayValue = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">{label}</span>
          {showInput && (
            <div className="flex items-center gap-0.5">
              <input
                type="number"
                value={displayValue}
                min={min}
                max={max}
                step={step}
                onChange={handleInputChange}
                className="w-14 text-right text-xs bg-[var(--bg-panel)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              {unit && <span className="text-xs text-[var(--text-muted)]">{unit}</span>}
            </div>
          )}
        </div>
      )}
      <RadixSlider.Root
        className="relative flex items-center select-none touch-none w-full h-4"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      >
        <RadixSlider.Track className="relative grow rounded-full h-1 bg-[rgba(255,255,255,0.1)]">
          <RadixSlider.Range className="absolute rounded-full h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className="block w-3.5 h-3.5 bg-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] hover:scale-110 transition-transform cursor-grab active:cursor-grabbing"
          aria-label={label}
        />
      </RadixSlider.Root>
    </div>
  );
}
