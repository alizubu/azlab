'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, X, ChevronDown } from 'lucide-react';
import Fuse from 'fuse.js';
import { useFontStore, type FontMeta } from '@/store/fontStore';
import { useToolStore } from '@/store/toolStore';
import { loadGoogleFont } from '@/lib/fonts/fontLoader';
import { clsx } from 'clsx';

// Popular Google Fonts with metadata
const GOOGLE_FONTS: FontMeta[] = [
  { family: 'Inter', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'sans-serif', loaded: false },
  { family: 'Roboto', style: 'normal', weight: 400, source: 'google', scripts: ['Latin', 'Cyrillic'], category: 'sans-serif', loaded: false },
  { family: 'Open Sans', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'sans-serif', loaded: false },
  { family: 'Lato', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'sans-serif', loaded: false },
  { family: 'Montserrat', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'sans-serif', loaded: false },
  { family: 'Poppins', style: 'normal', weight: 400, source: 'google', scripts: ['Latin', 'Devanagari'], category: 'sans-serif', loaded: false },
  { family: 'Raleway', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'sans-serif', loaded: false },
  { family: 'Nunito', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'sans-serif', loaded: false },
  { family: 'Playfair Display', style: 'normal', weight: 400, source: 'google', scripts: ['Latin', 'Cyrillic'], category: 'serif', loaded: false },
  { family: 'Merriweather', style: 'normal', weight: 400, source: 'google', scripts: ['Latin', 'Cyrillic'], category: 'serif', loaded: false },
  { family: 'Lora', style: 'normal', weight: 400, source: 'google', scripts: ['Latin', 'Cyrillic'], category: 'serif', loaded: false },
  { family: 'Georgia', style: 'normal', weight: 400, source: 'system', scripts: ['Latin'], category: 'serif', loaded: true },
  { family: 'Pacifico', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'handwriting', loaded: false },
  { family: 'Dancing Script', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'handwriting', loaded: false },
  { family: 'Caveat', style: 'normal', weight: 400, source: 'google', scripts: ['Latin', 'Cyrillic'], category: 'handwriting', loaded: false },
  { family: 'JetBrains Mono', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'monospace', loaded: false },
  { family: 'Fira Code', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'monospace', loaded: false },
  { family: 'Bebas Neue', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'display', loaded: false },
  { family: 'Oswald', style: 'normal', weight: 400, source: 'google', scripts: ['Latin', 'Cyrillic'], category: 'sans-serif', loaded: false },
  { family: 'Anton', style: 'normal', weight: 400, source: 'google', scripts: ['Latin'], category: 'sans-serif', loaded: false },
  // Bangla fonts
  { family: 'Hind Siliguri', style: 'normal', weight: 400, source: 'google', scripts: ['Latin', 'Bengali'], category: 'sans-serif', loaded: false },
  { family: 'Noto Sans Bengali', style: 'normal', weight: 400, source: 'google', scripts: ['Bengali'], category: 'sans-serif', loaded: false },
  { family: 'Baloo Da 2', style: 'normal', weight: 400, source: 'google', scripts: ['Bengali', 'Latin'], category: 'display', loaded: false },
  { family: 'Tiro Bangla', style: 'normal', weight: 400, source: 'google', scripts: ['Bengali', 'Latin'], category: 'serif', loaded: false },
  // Arabic fonts
  { family: 'Noto Sans Arabic', style: 'normal', weight: 400, source: 'google', scripts: ['Arabic'], category: 'sans-serif', loaded: false },
  { family: 'Cairo', style: 'normal', weight: 400, source: 'google', scripts: ['Arabic', 'Latin'], category: 'sans-serif', loaded: false },
  { family: 'Amiri', style: 'normal', weight: 400, source: 'google', scripts: ['Arabic', 'Latin'], category: 'serif', loaded: false },
  // Devanagari
  { family: 'Noto Sans Devanagari', style: 'normal', weight: 400, source: 'google', scripts: ['Devanagari'], category: 'sans-serif', loaded: false },
  { family: 'Mukta', style: 'normal', weight: 400, source: 'google', scripts: ['Devanagari', 'Latin'], category: 'sans-serif', loaded: false },
];

interface FontPickerProps {
  value: string;
  onChange: (family: string) => void;
  className?: string;
}

export function FontPicker({ value, onChange, className }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const { fonts, setFonts, uploadedFonts, recentFonts, searchQuery, setSearchQuery, addToRecent } = useFontStore();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Initialize fonts
  useEffect(() => {
    if (fonts.length === 0) {
      setFonts(GOOGLE_FONTS);
    }
  }, [fonts.length, setFonts]);

  const fuse = useMemo(
    () => new Fuse([...uploadedFonts, ...fonts], { keys: ['family'], threshold: 0.3 }),
    [fonts, uploadedFonts]
  );

  const filteredFonts = useMemo(() => {
    if (!searchQuery) return [...uploadedFonts, ...fonts];
    return fuse.search(searchQuery).map((r) => r.item);
  }, [searchQuery, fonts, uploadedFonts, fuse]);

  const handleSelect = useCallback(
    async (font: FontMeta) => {
      if (font.source === 'google' && !font.loaded) {
        try {
          await loadGoogleFont(font.family);
        } catch {
          // Font load failed, still apply
        }
      }
      onChange(font.family);
      addToRecent(font.family);
      setOpen(false);
      setSearchQuery('');
    },
    [onChange, addToRecent, setSearchQuery]
  );

  return (
    <div className={clsx('relative', className)}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className="text-sm text-[var(--text-primary)] truncate"
          style={{ fontFamily: value }}
        >
          {value}
        </span>
        <ChevronDown size={14} className={clsx('text-[var(--text-muted)] shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 z-[9999] glass-strong rounded-xl shadow-2xl overflow-hidden"
            style={{ maxHeight: '320px' }}
          >
            {/* Search */}
            <div className="p-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 bg-[var(--bg-panel)] rounded-lg px-2.5 py-1.5">
                <Search size={13} className="text-[var(--text-muted)] shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search fonts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-xs bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}>
                    <X size={12} className="text-[var(--text-muted)]" />
                  </button>
                )}
              </div>
            </div>

            {/* Font list */}
            <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
              {/* Recent */}
              {!searchQuery && recentFonts.length > 0 && (
                <FontGroup
                  title="Recent"
                  fonts={[...uploadedFonts, ...fonts].filter((f) => recentFonts.includes(f.family))}
                  selected={value}
                  onSelect={handleSelect}
                />
              )}

              {/* Uploaded */}
              {!searchQuery && uploadedFonts.length > 0 && (
                <FontGroup
                  title="My Fonts"
                  fonts={uploadedFonts}
                  selected={value}
                  onSelect={handleSelect}
                />
              )}

              {/* All / Search results */}
              <FontGroup
                title={searchQuery ? 'Results' : 'All Fonts'}
                fonts={filteredFonts}
                selected={value}
                onSelect={handleSelect}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FontGroup({
  title,
  fonts,
  selected,
  onSelect,
}: {
  title: string;
  fonts: FontMeta[];
  selected: string;
  onSelect: (font: FontMeta) => void;
}) {
  if (fonts.length === 0) return null;

  return (
    <div>
      <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider sticky top-0 bg-[rgba(19,19,26,0.9)]">
        {title}
      </div>
      {fonts.map((font) => (
        <button
          key={`${font.family}-${font.style}`}
          onClick={() => onSelect(font)}
          className={clsx(
            'w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--bg-panel-hover)] transition-colors text-left',
            selected === font.family && 'bg-[rgba(124,58,237,0.1)] text-[var(--accent-primary)]'
          )}
        >
          <span
            className="text-sm text-[var(--text-primary)]"
            style={{ fontFamily: font.loaded ? font.family : undefined }}
          >
            {font.family}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">{font.category}</span>
        </button>
      ))}
    </div>
  );
}
