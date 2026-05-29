'use client';

import React, { useCallback } from 'react';
import { FlipHorizontal, FlipVertical } from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { SectionHeader, AccordionSection } from '@/components/ui/Panel';

export function ImageAdjustPanel() {
  const { fabricCanvas } = useCanvasStore();

  const getActiveImage = useCallback(() => {
    if (!fabricCanvas) return null;
    const obj = fabricCanvas.getActiveObject();
    if (!obj || obj.type !== 'image') return null;
    return obj;
  }, [fabricCanvas]);

  const applyFilter = useCallback(
    async (filterType: string, value: number) => {
      const img = getActiveImage();
      if (!img) return;

      const fabricModule = await import('fabric');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fabricFilters = (fabricModule as any).filters;
      if (!fabricFilters) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filters: any[] = img.filters || [];
      const filtered = filters.filter((f: { type?: string }) => f.type !== filterType);

      if (filterType === 'Brightness' && fabricFilters.Brightness) {
        filtered.push(new fabricFilters.Brightness({ brightness: value }));
      } else if (filterType === 'Contrast' && fabricFilters.Contrast) {
        filtered.push(new fabricFilters.Contrast({ contrast: value }));
      } else if (filterType === 'Saturation' && fabricFilters.Saturation) {
        filtered.push(new fabricFilters.Saturation({ saturation: value }));
      } else if (filterType === 'HueRotation' && fabricFilters.HueRotation) {
        filtered.push(new fabricFilters.HueRotation({ rotation: value }));
      } else if (filterType === 'Blur' && fabricFilters.Blur) {
        filtered.push(new fabricFilters.Blur({ blur: value }));
      }

      img.filters = filtered;
      img.applyFilters();
      fabricCanvas?.renderAll();
    },
    [getActiveImage, fabricCanvas]
  );

  const handleFlipH = useCallback(() => {
    const img = getActiveImage();
    if (!img) return;
    img.set('flipX', !img.flipX);
    fabricCanvas?.renderAll();
  }, [getActiveImage, fabricCanvas]);

  const handleFlipV = useCallback(() => {
    const img = getActiveImage();
    if (!img) return;
    img.set('flipY', !img.flipY);
    fabricCanvas?.renderAll();
  }, [getActiveImage, fabricCanvas]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <SectionHeader title="Image" />

      {/* Quick actions */}
      <div className="p-3 border-b border-[var(--border)]">
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FlipHorizontal size={14} />} onClick={handleFlipH} className="flex-1">
            Flip H
          </Button>
          <Button variant="secondary" size="sm" icon={<FlipVertical size={14} />} onClick={handleFlipV} className="flex-1">
            Flip V
          </Button>
        </div>
      </div>

      {/* Adjustments */}
      <AccordionSection title="Adjustments" defaultOpen>
        <Slider
          label="Brightness"
          value={0}
          min={-1}
          max={1}
          step={0.01}
          decimals={2}
          onChange={(v) => applyFilter('Brightness', v)}
        />
        <Slider
          label="Contrast"
          value={0}
          min={-1}
          max={1}
          step={0.01}
          decimals={2}
          onChange={(v) => applyFilter('Contrast', v)}
        />
        <Slider
          label="Saturation"
          value={0}
          min={-1}
          max={1}
          step={0.01}
          decimals={2}
          onChange={(v) => applyFilter('Saturation', v)}
        />
        <Slider
          label="Hue Rotate"
          value={0}
          min={-Math.PI}
          max={Math.PI}
          step={0.01}
          decimals={2}
          onChange={(v) => applyFilter('HueRotation', v)}
        />
        <Slider
          label="Blur"
          value={0}
          min={0}
          max={1}
          step={0.01}
          decimals={2}
          onChange={(v) => applyFilter('Blur', v)}
        />
      </AccordionSection>

      {/* Opacity */}
      <div className="p-3 border-b border-[var(--border)]">
        <Slider
          label="Opacity"
          value={100}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(v) => {
            const img = getActiveImage();
            if (!img) return;
            img.set('opacity', v / 100);
            fabricCanvas?.renderAll();
          }}
        />
      </div>
    </div>
  );
}
