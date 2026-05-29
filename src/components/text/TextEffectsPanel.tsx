'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useToolStore } from '@/store/toolStore';
import { Slider } from '@/components/ui/Slider';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { AccordionSection } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import * as Switch from '@radix-ui/react-switch';
import { clsx } from 'clsx';

function EffectToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Switch.Root
      checked={enabled}
      onCheckedChange={onToggle}
      className={clsx(
        'w-8 h-4 rounded-full transition-colors',
        enabled ? 'bg-[var(--accent-primary)]' : 'bg-[rgba(255,255,255,0.1)]'
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Switch.Thumb
        className={clsx(
          'block w-3 h-3 rounded-full bg-white shadow transition-transform',
          enabled ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </Switch.Root>
  );
}

export function TextEffectsPanel() {
  const {
    textSettings,
    updateTextEffects,
    addShadow,
    removeShadow,
    updateShadow,
    addStroke,
    removeStroke,
    updateStroke,
    addGradientStop,
    removeGradientStop,
    updateGradientStop,
  } = useToolStore();

  const { effects } = textSettings;

  return (
    <div className="border-t border-[var(--border)]">
      {/* Shadow */}
      <AccordionSection
        title="Shadow"
        action={
          <Button size="xs" variant="ghost" icon={<Plus size={12} />} onClick={addShadow}>
            Add
          </Button>
        }
      >
        {effects.shadows.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No shadows. Click Add to create one.</p>
        ) : (
          effects.shadows.map((shadow) => (
            <div key={shadow.id} className="space-y-2 p-2 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <ColorPicker color={shadow.color} onChange={(c) => updateShadow(shadow.id, { color: c })} />
                <button onClick={() => removeShadow(shadow.id)} className="text-[var(--text-muted)] hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </div>
              <Slider label="X" value={shadow.x} min={-50} max={50} step={1} unit="px" onChange={(v) => updateShadow(shadow.id, { x: v })} />
              <Slider label="Y" value={shadow.y} min={-50} max={50} step={1} unit="px" onChange={(v) => updateShadow(shadow.id, { y: v })} />
              <Slider label="Blur" value={shadow.blur} min={0} max={50} step={1} unit="px" onChange={(v) => updateShadow(shadow.id, { blur: v })} />
              <Slider label="Spread" value={shadow.spread} min={0} max={20} step={1} unit="px" onChange={(v) => updateShadow(shadow.id, { spread: v })} />
            </div>
          ))
        )}
      </AccordionSection>

      {/* Outer Glow */}
      <AccordionSection
        title="Outer Glow"
        badge={
          <EffectToggle
            enabled={effects.outerGlow.enabled}
            onToggle={() => updateTextEffects({ outerGlow: { ...effects.outerGlow, enabled: !effects.outerGlow.enabled } })}
          />
        }
      >
        <ColorPicker
          label="Color"
          color={effects.outerGlow.color}
          onChange={(c) => updateTextEffects({ outerGlow: { ...effects.outerGlow, color: c } })}
        />
        <Slider label="Blur" value={effects.outerGlow.blur} min={0} max={100} step={1} unit="px"
          onChange={(v) => updateTextEffects({ outerGlow: { ...effects.outerGlow, blur: v } })} />
        <Slider label="Spread" value={effects.outerGlow.spread} min={0} max={50} step={1} unit="px"
          onChange={(v) => updateTextEffects({ outerGlow: { ...effects.outerGlow, spread: v } })} />
        <Slider label="Opacity" value={effects.outerGlow.opacity} min={0} max={100} step={1} unit="%"
          onChange={(v) => updateTextEffects({ outerGlow: { ...effects.outerGlow, opacity: v } })} />
      </AccordionSection>

      {/* Stroke */}
      <AccordionSection
        title="Stroke / Outline"
        action={
          <Button size="xs" variant="ghost" icon={<Plus size={12} />} onClick={addStroke}>
            Add
          </Button>
        }
      >
        {effects.strokes.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No strokes. Click Add to create one.</p>
        ) : (
          effects.strokes.map((stroke) => (
            <div key={stroke.id} className="space-y-2 p-2 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <ColorPicker color={stroke.color} onChange={(c) => updateStroke(stroke.id, { color: c })} />
                <button onClick={() => removeStroke(stroke.id)} className="text-[var(--text-muted)] hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </div>
              <Slider label="Width" value={stroke.width} min={0} max={20} step={0.5} unit="px"
                onChange={(v) => updateStroke(stroke.id, { width: v })} />
              <div className="flex gap-1">
                {(['inside', 'center', 'outside'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateStroke(stroke.id, { position: pos })}
                    className={clsx(
                      'flex-1 py-1 text-[10px] rounded border transition-colors capitalize',
                      stroke.position === pos
                        ? 'border-[var(--accent-primary)] bg-[rgba(124,58,237,0.15)] text-[var(--accent-primary)]'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    )}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </AccordionSection>

      {/* Gradient Fill */}
      <AccordionSection
        title="Gradient Fill"
        badge={
          <EffectToggle
            enabled={effects.gradientFill.enabled}
            onToggle={() => updateTextEffects({ gradientFill: { ...effects.gradientFill, enabled: !effects.gradientFill.enabled } })}
          />
        }
      >
        <div className="flex gap-1 mb-2">
          {(['linear', 'radial', 'angular'] as const).map((type) => (
            <button
              key={type}
              onClick={() => updateTextEffects({ gradientFill: { ...effects.gradientFill, type } })}
              className={clsx(
                'flex-1 py-1 text-[10px] rounded border transition-colors capitalize',
                effects.gradientFill.type === type
                  ? 'border-[var(--accent-primary)] bg-[rgba(124,58,237,0.15)] text-[var(--accent-primary)]'
                  : 'border-[var(--border)] text-[var(--text-muted)]'
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {effects.gradientFill.type === 'linear' && (
          <Slider label="Angle" value={effects.gradientFill.angle} min={0} max={360} step={1} unit="°"
            onChange={(v) => updateTextEffects({ gradientFill: { ...effects.gradientFill, angle: v } })} />
        )}

        <div className="space-y-1.5">
          {effects.gradientFill.stops.map((stop) => (
            <div key={stop.id} className="flex items-center gap-2">
              <ColorPicker color={stop.color} onChange={(c) => updateGradientStop(stop.id, { color: c })} showAlpha={false} />
              <Slider
                value={stop.position}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={(v) => updateGradientStop(stop.id, { position: v })}
                className="flex-1"
              />
              {effects.gradientFill.stops.length > 2 && (
                <button onClick={() => removeGradientStop(stop.id)} className="text-[var(--text-muted)] hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          <Button size="xs" variant="ghost" icon={<Plus size={12} />} onClick={addGradientStop}>
            Add Stop
          </Button>
        </div>
      </AccordionSection>

      {/* Blur */}
      <AccordionSection
        title="Blur"
        badge={
          <EffectToggle
            enabled={effects.blur.enabled}
            onToggle={() => updateTextEffects({ blur: { ...effects.blur, enabled: !effects.blur.enabled } })}
          />
        }
      >
        <Slider label="Radius" value={effects.blur.radius} min={0} max={50} step={0.5} unit="px"
          onChange={(v) => updateTextEffects({ blur: { ...effects.blur, radius: v } })} />
      </AccordionSection>

      {/* Background */}
      <AccordionSection
        title="Text Background"
        badge={
          <EffectToggle
            enabled={effects.background.enabled}
            onToggle={() => updateTextEffects({ background: { ...effects.background, enabled: !effects.background.enabled } })}
          />
        }
      >
        <ColorPicker
          label="Color"
          color={effects.background.color}
          onChange={(c) => updateTextEffects({ background: { ...effects.background, color: c } })}
        />
        <Slider label="Padding" value={effects.background.padding} min={0} max={40} step={1} unit="px"
          onChange={(v) => updateTextEffects({ background: { ...effects.background, padding: v } })} />
        <Slider label="Border Radius" value={effects.background.borderRadius} min={0} max={24} step={1} unit="px"
          onChange={(v) => updateTextEffects({ background: { ...effects.background, borderRadius: v } })} />
      </AccordionSection>

      {/* 3D Extrude */}
      <AccordionSection
        title="3D Effect"
        badge={
          <EffectToggle
            enabled={effects.extrude3d.enabled}
            onToggle={() => updateTextEffects({ extrude3d: { ...effects.extrude3d, enabled: !effects.extrude3d.enabled } })}
          />
        }
      >
        <Slider label="Depth" value={effects.extrude3d.depth} min={1} max={30} step={1} unit="px"
          onChange={(v) => updateTextEffects({ extrude3d: { ...effects.extrude3d, depth: v } })} />
        <Slider label="Angle" value={effects.extrude3d.angle} min={0} max={360} step={1} unit="°"
          onChange={(v) => updateTextEffects({ extrude3d: { ...effects.extrude3d, angle: v } })} />
        <ColorPicker
          label="Color"
          color={effects.extrude3d.color}
          onChange={(c) => updateTextEffects({ extrude3d: { ...effects.extrude3d, color: c } })}
        />
      </AccordionSection>
    </div>
  );
}
