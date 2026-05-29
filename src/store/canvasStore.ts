'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type BlendMode =
  | 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken'
  | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light'
  | 'soft-light' | 'difference' | 'exclusion' | 'hue'
  | 'saturation' | 'color' | 'luminosity';

export interface CanvasObject {
  id: string;
  type: 'text' | 'image' | 'shape' | 'group';
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  fabricId?: string; // fabric object id
}

export interface CanvasSize {
  width: number;
  height: number;
  name: string;
  unit: 'px' | 'mm' | 'cm' | 'in';
}

export interface SmartGuide {
  type: 'horizontal' | 'vertical';
  position: number;
}

export interface HistoryEntry {
  id: string;
  label: string;
  timestamp: number;
  canvasJSON: string;
}

interface CanvasState {
  // Canvas dimensions
  canvasSize: CanvasSize;
  zoom: number;
  panX: number;
  panY: number;

  // Objects / layers
  objects: CanvasObject[];
  selectedIds: string[];

  // Smart guides
  guides: SmartGuide[];
  showGuides: boolean;
  showGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  snapEnabled: boolean;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // Fabric canvas ref (stored as any to avoid SSR issues)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fabricCanvas: any | null;

  // Actions
  setCanvasSize: (size: Partial<CanvasSize>) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setObjects: (objects: CanvasObject[]) => void;
  addObject: (obj: CanvasObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  reorderObjects: (fromIndex: number, toIndex: number) => void;
  setSelectedIds: (ids: string[]) => void;
  setGuides: (guides: SmartGuide[]) => void;
  toggleGuides: () => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  toggleRulers: () => void;
  toggleSnap: () => void;
  pushHistory: (label: string, canvasJSON: string) => void;
  jumpToHistory: (index: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFabricCanvas: (canvas: any) => void;
}

export const useCanvasStore = create<CanvasState>()(
  immer((set) => ({
    canvasSize: { width: 1080, height: 1080, name: 'Instagram Post', unit: 'px' },
    zoom: 1,
    panX: 0,
    panY: 0,
    objects: [],
    selectedIds: [],
    guides: [],
    showGuides: true,
    showGrid: false,
    gridSize: 20,
    showRulers: true,
    snapEnabled: true,
    history: [],
    historyIndex: -1,
    fabricCanvas: null,

    setCanvasSize: (size) =>
      set((state) => { Object.assign(state.canvasSize, size); }),

    setZoom: (zoom) =>
      set((state) => { state.zoom = Math.max(0.05, Math.min(10, zoom)); }),

    setPan: (x, y) =>
      set((state) => { state.panX = x; state.panY = y; }),

    setObjects: (objects) =>
      set((state) => { state.objects = objects; }),

    addObject: (obj) =>
      set((state) => { state.objects.unshift(obj); }),

    removeObject: (id) =>
      set((state) => {
        state.objects = state.objects.filter((o) => o.id !== id);
        state.selectedIds = state.selectedIds.filter((sid) => sid !== id);
      }),

    updateObject: (id, updates) =>
      set((state) => {
        const obj = state.objects.find((o) => o.id === id);
        if (obj) Object.assign(obj, updates);
      }),

    reorderObjects: (fromIndex, toIndex) =>
      set((state) => {
        const [item] = state.objects.splice(fromIndex, 1);
        state.objects.splice(toIndex, 0, item);
      }),

    setSelectedIds: (ids) =>
      set((state) => { state.selectedIds = ids; }),

    setGuides: (guides) =>
      set((state) => { state.guides = guides; }),

    toggleGuides: () =>
      set((state) => { state.showGuides = !state.showGuides; }),

    toggleGrid: () =>
      set((state) => { state.showGrid = !state.showGrid; }),

    setGridSize: (size) =>
      set((state) => { state.gridSize = size; }),

    toggleRulers: () =>
      set((state) => { state.showRulers = !state.showRulers; }),

    toggleSnap: () =>
      set((state) => { state.snapEnabled = !state.snapEnabled; }),

    pushHistory: (label, canvasJSON) =>
      set((state) => {
        // Truncate forward history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          id: crypto.randomUUID(),
          label,
          timestamp: Date.now(),
          canvasJSON,
        });
        // Keep max 50 entries
        if (state.history.length > 50) {
          state.history.shift();
        }
        state.historyIndex = state.history.length - 1;
      }),

    jumpToHistory: (index) =>
      set((state) => { state.historyIndex = index; }),

    setFabricCanvas: (canvas) =>
      set((state) => { state.fabricCanvas = canvas; }),
  }))
);
