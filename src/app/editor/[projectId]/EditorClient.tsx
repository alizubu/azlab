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
import { useCanvasStore } from '@/store/canvasStore';
import { restoreUploadedFonts } from '@/lib/fonts/fontLoader';
import { useFontStore } from '@/store/fontStore';
import { loadDraft } from '@/lib/canvas/canvasSerialization';

interface EditorClientProps { projectId: string }

export function EditorClient({ projectId }: EditorClientProps) {
  const [activePanel,          setActivePanel]          = useState<string | null>('layers');
  const [commandPaletteOpen,   setCommandPaletteOpen]   = useState(false);
  const [exportOpen,           setExportOpen]           = useState(false);
  const { setCurrentProject, addProject } = useProjectStore();
  const { addUploadedFont } = useFontStore();
  const { setCanvasSize } = useCanvasStore();

  // Init project record — restore name/size from draft if available
  useEffect(() => {
    const existing = useProjectStore.getState().projects.find(p => p.id === projectId);
    if (!existing) {
      const draft = loadDraft(projectId);
      const p = {
        id: projectId,
        name: draft?.meta.projectName ?? 'Untitled Design',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        canvasWidth:  draft?.meta.canvasWidth  ?? 1080,
        canvasHeight: draft?.meta.canvasHeight ?? 1080,
        tags: [],
      };
      addProject(p);
      setCurrentProject(p);
      if (draft) {
        setCanvasSize({ width: draft.meta.canvasWidth, height: draft.meta.canvasHeight });
      }
    } else {
      setCurrentProject(existing);
    }
  }, [projectId, addProject, setCurrentProject, setCanvasSize]);

  // Restore uploaded fonts
  useEffect(() => {
    restoreUploadedFonts().then(fonts => {
      fonts.forEach(font => addUploadedFont({
        family: font.family, style: font.style, weight: font.weight,
        source: 'uploaded', scripts: font.scripts,
        category: font.category as 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace',
        loaded: true, uploadedId: String(font.id),
      }));
    }).catch(() => {});
  }, [addUploadedFont]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCommandPaletteOpen(o => !o); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') { e.preventDefault(); setExportOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handlePanelToggle = useCallback((panel: string) => {
    setActivePanel(cur => cur === panel ? null : panel);
  }, []);

  return (
    <div
      className="flex flex-col overflow-hidden bg-[var(--bg-base)]"
      style={{ height: '100dvh' }}
    >
      {/* Top bar */}
      <TopBar projectId={projectId} />

      {/* Editor body */}
      <div className="flex overflow-hidden" style={{ flex: '1 1 0', minHeight: 0 }}>

        {/* Left toolbar */}
        <LeftToolbar activePanel={activePanel} onPanelToggle={handlePanelToggle} />

        {/* Left panel (layers / fonts / assets / history) */}
        <LeftPanel activePanel={activePanel} onClose={() => setActivePanel(null)} />

        {/* Canvas area */}
        <div className="relative flex flex-col overflow-hidden" style={{ flex: '1 1 0', minWidth: 0 }}>
          <TextToolbar />
          <CanvasWorkspace projectId={projectId} />
        </div>

        {/* Right panel (typography / image) */}
        <RightPanel />
      </div>

      {/* Modals & overlays */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onExport={() => setExportOpen(true)}
        onSave={() => {}}
      />
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
