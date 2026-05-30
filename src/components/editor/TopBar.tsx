'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Undo2, Redo2, Download, Save, ChevronLeft,
  Zap, Maximize2,
} from 'lucide-react';
import Link from 'next/link';
import { useCanvasStore } from '@/store/canvasStore';
import { useProjectStore } from '@/store/projectStore';
import { Button, IconButton } from '@/components/ui/Button';
import { ExportModal } from '@/components/export/ExportModal';
import { CanvasSizeDialog } from './CanvasSizeDialog';
import { serializeCanvas } from '@/lib/canvas/fabricSetup';
import { saveDraft } from '@/lib/canvas/canvasSerialization';
import { toast } from 'sonner';
import { clsx } from 'clsx';

interface TopBarProps {
  projectId: string;
}

export function TopBar({ projectId }: TopBarProps) {
  const { fabricCanvas, history, historyIndex, canvasSize } = useCanvasStore();
  const { currentProject, updateProject, isDirty, setLastSaved } = useProjectStore();
  const [exportOpen, setExportOpen] = useState(false);
  const [canvasSizeOpen, setCanvasSizeOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(currentProject?.name ?? 'Untitled Design');
  const [saving, setSaving] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (!fabricCanvas || !canUndo) return;
    const prevEntry = history[historyIndex - 1];
    fabricCanvas.loadFromJSON(JSON.parse(prevEntry.canvasJSON), () => {
      fabricCanvas.renderAll();
    });
    useCanvasStore.getState().jumpToHistory(historyIndex - 1);
  }, [fabricCanvas, canUndo, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (!fabricCanvas || !canRedo) return;
    const nextEntry = history[historyIndex + 1];
    fabricCanvas.loadFromJSON(JSON.parse(nextEntry.canvasJSON), () => {
      fabricCanvas.renderAll();
    });
    useCanvasStore.getState().jumpToHistory(historyIndex + 1);
  }, [fabricCanvas, canRedo, history, historyIndex]);

  const handleSave = useCallback(async () => {
    if (!fabricCanvas) return;
    setSaving(true);
    try {
      const json = serializeCanvas(fabricCanvas);
      saveDraft(projectId, json, {
        projectId,
        canvasWidth: canvasSize.width,
        canvasHeight: canvasSize.height,
        projectName: nameValue,
      });
      updateProject(projectId, { canvasJSON: json, updatedAt: Date.now() });
      setLastSaved(Date.now());
      toast.success('Saved successfully');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }, [fabricCanvas, projectId, canvasSize, nameValue, updateProject, setLastSaved]);

  const handleNameSave = useCallback(() => {
    setEditingName(false);
    updateProject(projectId, { name: nameValue });
  }, [nameValue, projectId, updateProject]);

  return (
    <>
      <motion.header
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between px-3 h-12 glass-strong border-b border-[var(--border)] shrink-0 z-30"
      >
        {/* Left: Back + Project name */}
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/projects">
            <IconButton icon={<ChevronLeft size={16} />} tooltip="Back to Projects" size="sm" />
          </Link>

          <div className="flex items-center gap-1.5">
            {/* AZLab logo */}
            <div className="flex items-center gap-1.5 mr-1">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                <Zap size={12} className="text-white" />
              </div>
            </div>

            {editingName ? (
              <input
                autoFocus
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') { setEditingName(false); setNameValue(currentProject?.name ?? 'Untitled'); }
                }}
                className="text-sm font-medium bg-[var(--bg-panel)] border border-[var(--accent-primary)] rounded px-2 py-0.5 text-[var(--text-primary)] focus:outline-none w-48"
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors truncate max-w-48"
              >
                {nameValue}
              </button>
            )}

            {isDirty && (
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shrink-0" title="Unsaved changes" />
            )}
          </div>
        </div>

        {/* Center: Undo/Redo + Canvas size */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={<Undo2 size={15} />}
            tooltip="Undo (Ctrl+Z)"
            onClick={handleUndo}
            disabled={!canUndo}
            size="sm"
          />
          <IconButton
            icon={<Redo2 size={15} />}
            tooltip="Redo (Ctrl+Y)"
            onClick={handleRedo}
            disabled={!canRedo}
            size="sm"
          />
          <div className="w-px h-5 bg-[var(--border)] mx-1" />
          <button
            onClick={() => setCanvasSizeOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)] transition-colors"
          >
            <Maximize2 size={12} />
            {canvasSize.width}×{canvasSize.height}
          </button>
        </div>

        {/* Right: Save + Export */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            icon={saving ? undefined : <Save size={14} />}
            loading={saving}
            onClick={handleSave}
            className={clsx(isDirty && 'text-[var(--accent-primary)]')}
          >
            Save
          </Button>
          <Button
            variant="gradient"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => setExportOpen(true)}
          >
            Export
          </Button>
        </div>
      </motion.header>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <CanvasSizeDialog open={canvasSizeOpen} onClose={() => setCanvasSizeOpen(false)} />
    </>
  );
}
