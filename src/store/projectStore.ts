'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  canvasWidth: number;
  canvasHeight: number;
  tags: string[];
  canvasJSON?: string;
}

export interface CanvasTemplate {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'cm' | 'in';
  thumbnail?: string;
  canvasJSON?: string;
}

export const CANVAS_PRESETS: CanvasTemplate[] = [
  { id: 'ig-post', name: 'Instagram Post', category: 'Social', width: 1080, height: 1080, unit: 'px' },
  { id: 'ig-story', name: 'Instagram Story', category: 'Social', width: 1080, height: 1920, unit: 'px' },
  { id: 'ig-landscape', name: 'Instagram Landscape', category: 'Social', width: 1080, height: 566, unit: 'px' },
  { id: 'fb-post', name: 'Facebook Post', category: 'Social', width: 1200, height: 630, unit: 'px' },
  { id: 'fb-cover', name: 'Facebook Cover', category: 'Social', width: 820, height: 312, unit: 'px' },
  { id: 'tw-post', name: 'Twitter Post', category: 'Social', width: 1200, height: 675, unit: 'px' },
  { id: 'yt-thumb', name: 'YouTube Thumbnail', category: 'Video', width: 1280, height: 720, unit: 'px' },
  { id: 'yt-banner', name: 'YouTube Banner', category: 'Video', width: 2560, height: 1440, unit: 'px' },
  { id: 'a4', name: 'A4 Document', category: 'Print', width: 210, height: 297, unit: 'mm' },
  { id: 'a3', name: 'A3 Document', category: 'Print', width: 297, height: 420, unit: 'mm' },
  { id: 'letter', name: 'US Letter', category: 'Print', width: 8.5, height: 11, unit: 'in' },
  { id: 'business-card', name: 'Business Card', category: 'Print', width: 85, height: 55, unit: 'mm' },
  { id: 'presentation', name: 'Presentation', category: 'Presentation', width: 1920, height: 1080, unit: 'px' },
  { id: 'phone', name: 'Phone Screen', category: 'UI', width: 390, height: 844, unit: 'px' },
  { id: 'tablet', name: 'Tablet Screen', category: 'UI', width: 768, height: 1024, unit: 'px' },
  { id: 'desktop', name: 'Desktop Screen', category: 'UI', width: 1440, height: 900, unit: 'px' },
  { id: 'custom', name: 'Custom Size', category: 'Custom', width: 800, height: 600, unit: 'px' },
];

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isDirty: boolean;
  lastSaved: number | null;
  autoSaveEnabled: boolean;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  setDirty: (dirty: boolean) => void;
  setLastSaved: (ts: number) => void;
  toggleAutoSave: () => void;
  duplicateProject: (id: string) => Project;
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    projects: [],
    currentProject: null,
    isDirty: false,
    lastSaved: null,
    autoSaveEnabled: true,

    setProjects: (projects) =>
      set((state) => { state.projects = projects; }),

    addProject: (project) =>
      set((state) => { state.projects.unshift(project); }),

    updateProject: (id, updates) =>
      set((state) => {
        const proj = state.projects.find((p) => p.id === id);
        if (proj) Object.assign(proj, updates);
        if (state.currentProject?.id === id) {
          Object.assign(state.currentProject, updates);
        }
      }),

    deleteProject: (id) =>
      set((state) => {
        state.projects = state.projects.filter((p) => p.id !== id);
        if (state.currentProject?.id === id) {
          state.currentProject = null;
        }
      }),

    setCurrentProject: (project) =>
      set((state) => { state.currentProject = project; }),

    setDirty: (dirty) =>
      set((state) => { state.isDirty = dirty; }),

    setLastSaved: (ts) =>
      set((state) => { state.lastSaved = ts; state.isDirty = false; }),

    toggleAutoSave: () =>
      set((state) => { state.autoSaveEnabled = !state.autoSaveEnabled; }),

    duplicateProject: (id) => {
      const { projects } = get();
      const original = projects.find((p) => p.id === id);
      if (!original) throw new Error('Project not found');
      const copy: Project = {
        ...original,
        id: crypto.randomUUID(),
        name: `${original.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set((state) => { state.projects.unshift(copy); });
      return copy;
    },
  }))
);
