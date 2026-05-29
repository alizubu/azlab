'use client';

import React from 'react';

interface Guide {
  type: 'h' | 'v';
  pos: number;
}

interface SmartGuidesProps {
  guides: Guide[];
  zoom: number;
  panX: number;
  panY: number;
}

export function SmartGuides({ guides, zoom, panX, panY }: SmartGuidesProps) {
  if (guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {guides.map((guide, i) => (
        guide.type === 'h' ? (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-[var(--accent-secondary)]"
            style={{ top: guide.pos * zoom + panY, opacity: 0.8 }}
          />
        ) : (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-[var(--accent-secondary)]"
            style={{ left: guide.pos * zoom + panX, opacity: 0.8 }}
          />
        )
      ))}
    </div>
  );
}
