'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface FontMeta {
  family: string;
  style: string;
  weight: number;
  source: 'google' | 'system' | 'uploaded';
  scripts: string[];
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  loaded: boolean;
  uploadedId?: string; // IndexedDB key for uploaded fonts
}

interface FontState {
  fonts: FontMeta[];
  recentFonts: string[];
  uploadedFonts: FontMeta[];
  loadingFonts: Set<string>;
  searchQuery: string;
  filterScript: string;
  filterCategory: string;

  setFonts: (fonts: FontMeta[]) => void;
  addUploadedFont: (font: FontMeta) => void;
  removeUploadedFont: (family: string) => void;
  markFontLoaded: (family: string) => void;
  addToRecent: (family: string) => void;
  setLoadingFont: (family: string, loading: boolean) => void;
  setSearchQuery: (q: string) => void;
  setFilterScript: (s: string) => void;
  setFilterCategory: (c: string) => void;
}

export const useFontStore = create<FontState>()(
  immer((set) => ({
    fonts: [],
    recentFonts: [],
    uploadedFonts: [],
    loadingFonts: new Set(),
    searchQuery: '',
    filterScript: 'all',
    filterCategory: 'all',

    setFonts: (fonts) =>
      set((state) => { state.fonts = fonts; }),

    addUploadedFont: (font) =>
      set((state) => {
        const exists = state.uploadedFonts.findIndex((f) => f.family === font.family);
        if (exists >= 0) {
          state.uploadedFonts[exists] = font;
        } else {
          state.uploadedFonts.unshift(font);
        }
      }),

    removeUploadedFont: (family) =>
      set((state) => {
        state.uploadedFonts = state.uploadedFonts.filter((f) => f.family !== family);
      }),

    markFontLoaded: (family) =>
      set((state) => {
        const font = state.fonts.find((f) => f.family === family);
        if (font) font.loaded = true;
        const uploaded = state.uploadedFonts.find((f) => f.family === family);
        if (uploaded) uploaded.loaded = true;
        state.loadingFonts.delete(family);
      }),

    addToRecent: (family) =>
      set((state) => {
        state.recentFonts = [
          family,
          ...state.recentFonts.filter((f) => f !== family),
        ].slice(0, 10);
      }),

    setLoadingFont: (family, loading) =>
      set((state) => {
        if (loading) {
          state.loadingFonts.add(family);
        } else {
          state.loadingFonts.delete(family);
        }
      }),

    setSearchQuery: (q) =>
      set((state) => { state.searchQuery = q; }),

    setFilterScript: (s) =>
      set((state) => { state.filterScript = s; }),

    setFilterCategory: (c) =>
      set((state) => { state.filterCategory = c; }),
  }))
);
