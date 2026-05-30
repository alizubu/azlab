'use client';

import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { FontUploader } from './FontUploader';
import { useFontStore } from '@/store/fontStore';
import { useToolStore } from '@/store/toolStore';
import { SectionHeader } from '@/components/ui/Panel';
import { loadGoogleFont } from '@/lib/fonts/fontLoader';
import { clsx } from 'clsx';

export function FontLibrary() {
  const { fonts, uploadedFonts, recentFonts, addToRecent } = useFontStore();
  const { textSettings, updateTextSettings } = useToolStore();

  const handleSelectFont = async (family: string, source: string) => {
    if (source === 'google') {
      try { await loadGoogleFont(family); } catch { /* ignore */ }
    }
    updateTextSettings({ fontFamily: family });
    addToRecent(family);
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Fonts" />

      <Tabs.Root defaultValue="all" className="flex flex-col flex-1 overflow-hidden">
        <Tabs.List className="flex border-b border-[var(--border)] px-2 pt-1 gap-1 shrink-0">
          {['all', 'recent', 'uploaded', 'upload'].map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className={clsx(
                'px-2.5 py-1.5 text-xs rounded-t-md transition-colors capitalize',
                'data-[state=active]:text-[var(--accent-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent-primary)]',
                'data-[state=inactive]:text-[var(--text-muted)] data-[state=inactive]:hover:text-[var(--text-primary)]'
              )}
            >
              {tab === 'upload' ? '+ Upload' : tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="all" className="flex-1 overflow-y-auto">
          <FontList
            fonts={fonts}
            selected={textSettings.fontFamily}
            onSelect={handleSelectFont}
          />
        </Tabs.Content>

        <Tabs.Content value="recent" className="flex-1 overflow-y-auto">
          <FontList
            fonts={[...uploadedFonts, ...fonts].filter((f) => recentFonts.includes(f.family))}
            selected={textSettings.fontFamily}
            onSelect={handleSelectFont}
          />
        </Tabs.Content>

        <Tabs.Content value="uploaded" className="flex-1 overflow-y-auto">
          {uploadedFonts.length === 0 ? (
            <div className="p-4 text-center text-xs text-[var(--text-muted)]">
              No uploaded fonts yet.<br />Use the Upload tab to add your fonts.
            </div>
          ) : (
            <FontList
              fonts={uploadedFonts}
              selected={textSettings.fontFamily}
              onSelect={handleSelectFont}
            />
          )}
        </Tabs.Content>

        <Tabs.Content value="upload" className="flex-1 overflow-y-auto">
          <FontUploader />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function FontList({
  fonts,
  selected,
  onSelect,
}: {
  fonts: Array<{ family: string; source: string; category: string; scripts: string[] }>;
  selected: string;
  onSelect: (family: string, source: string) => void;
}) {
  if (fonts.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-[var(--text-muted)]">No fonts found</div>
    );
  }

  return (
    <div className="py-1">
      {fonts.map((font) => (
        <button
          key={font.family}
          onClick={() => onSelect(font.family, font.source)}
          className={clsx(
            'w-full flex items-center justify-between px-3 py-2.5 hover:bg-[var(--bg-panel-hover)] transition-colors text-left',
            selected === font.family && 'bg-[rgba(124,58,237,0.1)]'
          )}
        >
          <div>
            <p
              className="text-sm text-[var(--text-primary)]"
              style={{ fontFamily: font.family }}
            >
              {font.family}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {font.scripts.join(', ')} · {font.category}
            </p>
          </div>
          {selected === font.family && (
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
          )}
        </button>
      ))}
    </div>
  );
}
