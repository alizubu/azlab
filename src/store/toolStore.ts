'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ActiveTool =
  | 'select' | 'text' | 'image' | 'shape' | 'crop' | 'pan' | 'eyedropper';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextDirection = 'ltr' | 'rtl';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type TextDecoration = 'none' | 'underline' | 'line-through' | 'overline';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

export interface TextShadow {
  id: string;
  color: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
}

export interface GradientStop {
  id: string;
  color: string;
  position: number;
}

export interface TextStroke {
  id: string;
  color: string;
  width: number;
  position: 'inside' | 'outside' | 'center';
}

export interface TextEffects {
  shadows: TextShadow[];
  outerGlow: { enabled: boolean; color: string; blur: number; spread: number; opacity: number };
  strokes: TextStroke[];
  gradientFill: {
    enabled: boolean;
    type: 'linear' | 'radial' | 'angular';
    stops: GradientStop[];
    angle: number;
  };
  blur: { enabled: boolean; radius: number };
  background: { enabled: boolean; color: string; padding: number; borderRadius: number };
  extrude3d: { enabled: boolean; depth: number; angle: number; color: string };
}

export interface TextSettings {
  fontFamily: string;
  fontStyle: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  paragraphSpacing: number;
  textAlign: TextAlign;
  textDirection: TextDirection;
  verticalAlign: VerticalAlign;
  textTransform: TextTransform;
  textDecoration: TextDecoration;
  color: string;
  opacity: number;
  effects: TextEffects;
}

interface ToolState {
  activeTool: ActiveTool;
  textSettings: TextSettings;
  showTextEffects: boolean;

  setActiveTool: (tool: ActiveTool) => void;
  updateTextSettings: (updates: Partial<TextSettings>) => void;
  updateTextEffects: (updates: Partial<TextEffects>) => void;
  addShadow: () => void;
  removeShadow: (id: string) => void;
  updateShadow: (id: string, updates: Partial<TextShadow>) => void;
  addStroke: () => void;
  removeStroke: (id: string) => void;
  updateStroke: (id: string, updates: Partial<TextStroke>) => void;
  addGradientStop: () => void;
  removeGradientStop: (id: string) => void;
  updateGradientStop: (id: string, updates: Partial<GradientStop>) => void;
  toggleTextEffects: () => void;
}

const defaultEffects: TextEffects = {
  shadows: [],
  outerGlow: { enabled: false, color: '#7c3aed', blur: 20, spread: 0, opacity: 80 },
  strokes: [],
  gradientFill: {
    enabled: false,
    type: 'linear',
    stops: [
      { id: '1', color: '#7c3aed', position: 0 },
      { id: '2', color: '#06b6d4', position: 100 },
    ],
    angle: 135,
  },
  blur: { enabled: false, radius: 0 },
  background: { enabled: false, color: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 4 },
  extrude3d: { enabled: false, depth: 5, angle: 45, color: '#4a1d96' },
};

export const useToolStore = create<ToolState>()(
  immer((set) => ({
    activeTool: 'select',
    showTextEffects: false,
    textSettings: {
      fontFamily: 'Inter',
      fontStyle: 'normal',
      fontSize: 48,
      lineHeight: 1.2,
      letterSpacing: 0,
      wordSpacing: 0,
      paragraphSpacing: 0,
      textAlign: 'left',
      textDirection: 'ltr',
      verticalAlign: 'top',
      textTransform: 'none',
      textDecoration: 'none',
      color: '#1a1a2e',   // dark default — visible on white canvas
      opacity: 100,
      effects: defaultEffects,
    },

    setActiveTool: (tool) => set((state) => { state.activeTool = tool; }),
    updateTextSettings: (updates) => set((state) => { Object.assign(state.textSettings, updates); }),
    updateTextEffects: (updates) => set((state) => { Object.assign(state.textSettings.effects, updates); }),

    addShadow: () => set((state) => {
      state.textSettings.effects.shadows.push({ id: crypto.randomUUID(), color: 'rgba(0,0,0,0.5)', x: 2, y: 2, blur: 4, spread: 0 });
    }),
    removeShadow: (id) => set((state) => {
      state.textSettings.effects.shadows = state.textSettings.effects.shadows.filter(s => s.id !== id);
    }),
    updateShadow: (id, updates) => set((state) => {
      const s = state.textSettings.effects.shadows.find(s => s.id === id);
      if (s) Object.assign(s, updates);
    }),

    addStroke: () => set((state) => {
      state.textSettings.effects.strokes.push({ id: crypto.randomUUID(), color: '#000000', width: 2, position: 'outside' });
    }),
    removeStroke: (id) => set((state) => {
      state.textSettings.effects.strokes = state.textSettings.effects.strokes.filter(s => s.id !== id);
    }),
    updateStroke: (id, updates) => set((state) => {
      const s = state.textSettings.effects.strokes.find(s => s.id === id);
      if (s) Object.assign(s, updates);
    }),

    addGradientStop: () => set((state) => {
      state.textSettings.effects.gradientFill.stops.push({ id: crypto.randomUUID(), color: '#ffffff', position: 50 });
    }),
    removeGradientStop: (id) => set((state) => {
      state.textSettings.effects.gradientFill.stops = state.textSettings.effects.gradientFill.stops.filter(s => s.id !== id);
    }),
    updateGradientStop: (id, updates) => set((state) => {
      const s = state.textSettings.effects.gradientFill.stops.find(s => s.id === id);
      if (s) Object.assign(s, updates);
    }),

    toggleTextEffects: () => set((state) => { state.showTextEffects = !state.showTextEffects; }),
  }))
);
