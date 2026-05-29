'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from '@/components/editor/TopBar';
import { LeftToolbar } from '@/components/editor/LeftToolbar';
import { LeftPanel } from '@/components/editor/LeftPanel';
import { RightPanel } from '@/components/editor/RightPanel';
import { CanvasWorkspace } from '@/components/canvas/CanvasWorkspace';
import { CommandPalette } from '@/components/editor/CommandPalette';
import { ExportModal } from '@/components/export/ExportModal';
import { TextToolbar } from '@/components/editor/TextToolbar';
import { MobileToolbar } from '@/components/editor/MobileToolbar';
import { useProjectStore } from '@/store/projectStore';
import { restoreUploadedFonts } from '@/lib/fonts/fontLoader';
import { useFontStore } from '@/store/fontStore';

interface EditorClientProps {
  projectId: string;
}

export function EditorClient({ projectId }: EditorClientProps) {
  const [activePanel, setActivePanel] = useState<string | null>('layers');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const { setCurrentProject, addProject } = useProjectStore();
  const { addUploadedFont } = useFontStore();

  // Initialize project
  useEffect(() => {
    const existing = useProjectStore.getState().projects.find((p) => p.id === projectId);
    if (!existing) {
      const newProject = {
        id: projectId,
        name: 'Untitled Design',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        canvasWidth: 1080,
        canvasHeight: 1080,
        tags: [],
      };
      addProject(newProject);
      setCurrentProject(newProject);
    } else {
      setCurrentProject(existing);
    }
  }, [projectId, addProject, setCurrentProject]);

  // Restore uploaded fonts from IndexedDB
  useEffect(() => {
    restoreUploadedFonts().then((fonts) => {
      fonts.forEach((font) => {
        addUploadedFont({
          family: font.family,
          style: font.style,
          weight: font.weight,
          source: 'uploaded',
          scripts: font.scripts,
          category: font.category as 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace',
          loaded: true,
          uploadedId: String(font.id),
        });
      });
    }).catch(() => {
      // IndexedDB not available (SSR or private browsing)
    });
  }, [addUploadedFont]);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((o) => !o);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setExportOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePanelToggle = useCallback((panel: string) => {
    setActivePanel((current) => current === panel ? null : panel);
  }, []);

  const handleSave = useCallback(() => {
    // Trigger save via TopBar's save logic
    const saveBtn = document.querySelector('[data-save-btn]') as HTMLButtonElement;
    saveBtn?.click();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-base)]" data-theme="dark">
      {/* Top bar */}
      <TopBar projectId={projectId} />

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left toolbar */}
        <LeftToolbar activePanel={activePanel} onPanelToggle={handlePanelToggle} />

        {/* Left panel (layers, fonts, etc.) */}
        <div className="relative flex h-full">
          <LeftPanel activePanel={activePanel} onClose={() => setActivePanel(null)} />
        </div>

        {/* Canvas + floating toolbar */}
        <div className="relative flex-1 overflow-hidden">
          <TextToolbar />
          <CanvasWorkspace projectId={projectId} />
        </div>

        {/* Right panel (typography, image adjustments) */}
        <RightPanel />
      </div>

      {/* Command palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onExport={() => setExportOpen(true)}
        onSave={handleSave}
      />

      {/* Export modal */}
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />

      {/* Mobile bottom toolbar */}
      <MobileToolbar
        onExport={() => setExportOpen(true)}
        onLayersToggle={() => handlePanelToggle('layers')}
        onPropertiesToggle={() => handlePanelToggle('fonts')}
      />
    </div>
  );
}
