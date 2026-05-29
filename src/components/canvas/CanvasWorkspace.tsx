'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useToolStore } from '@/store/toolStore';
import { useProjectStore } from '@/store/projectStore';
import {
  initFabricCanvas,
  resizeFabricCanvas,
  addTextToCanvas,
  addImageToCanvas,
  serializeCanvas,
} from '@/lib/canvas/fabricSetup';
import { saveDraft } from '@/lib/canvas/canvasSerialization';
import { SmartGuides } from './SmartGuides';
import { CanvasControls } from './CanvasControls';

interface CanvasWorkspaceProps {
  projectId: string;
}

export function CanvasWorkspace({ projectId }: CanvasWorkspaceProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // fabricRef holds the live Fabric.js canvas instance — never stored in React state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef = useRef<any>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initDoneRef = useRef(false);

  const {
    canvasSize,
    zoom, setZoom,
    panX, panY, setPan,
    setFabricCanvas,
    setSelectedIds,
    addObject, removeObject,
    pushHistory,
    showGrid, gridSize,
    showRulers,
  } = useCanvasStore();

  const { activeTool, textSettings } = useToolStore();
  const { currentProject, setDirty, autoSaveEnabled } = useProjectStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [guides, setGuides] = useState<{ type: 'h' | 'v'; pos: number }[]>([]);

  // ─── Init Fabric once ────────────────────────────────────────────────────────
  useEffect(() => {
    if (initDoneRef.current) return;
    if (!canvasElRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const fc = await initFabricCanvas({
          canvasEl: canvasElRef.current!,
          width: canvasSize.width,
          height: canvasSize.height,
          onObjectSelected: (obj) => {
            setSelectedIds(obj ? [obj.get('id') as string].filter(Boolean) : []);
          },
          onObjectModified: () => { setDirty(true); scheduleAutoSave(); },
          onCanvasModified: () => { setDirty(true); scheduleAutoSave(); },
        });

        if (cancelled) { fc.dispose(); return; }

        fabricRef.current = fc;
        initDoneRef.current = true;
        // Share with store so other components (layers, export) can access it
        setFabricCanvas(fc);
        pushHistory('Canvas created', serializeCanvas(fc));
      } catch (err) {
        console.error('Fabric init failed:', err);
      }
    })();

    return () => {
      cancelled = true;
      if (fabricRef.current) {
        try { fabricRef.current.dispose(); } catch { /* ignore */ }
        fabricRef.current = null;
        initDoneRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Resize when canvasSize changes ─────────────────────────────────────────
  useEffect(() => {
    if (!fabricRef.current) return;
    resizeFabricCanvas(fabricRef.current, canvasSize.width, canvasSize.height);
  }, [canvasSize.width, canvasSize.height]);

  // ─── Fit to screen after init ────────────────────────────────────────────────
  const fitToScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { width: cw, height: ch } = container.getBoundingClientRect();
    const padding = 80;
    const newZoom = Math.min(
      (cw - padding * 2) / canvasSize.width,
      (ch - padding * 2) / canvasSize.height,
      1
    );
    setZoom(newZoom);
    setPan(
      (cw - canvasSize.width * newZoom) / 2,
      (ch - canvasSize.height * newZoom) / 2
    );
  }, [canvasSize.width, canvasSize.height, setZoom, setPan]);

  useEffect(() => {
    // Wait a tick for the container to have its final size
    const t = setTimeout(fitToScreen, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auto-save ───────────────────────────────────────────────────────────────
  const scheduleAutoSave = useCallback(() => {
    if (!autoSaveEnabled) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (!fabricRef.current) return;
      try {
        saveDraft(projectId, serializeCanvas(fabricRef.current), {
          projectId,
          canvasWidth: canvasSize.width,
          canvasHeight: canvasSize.height,
          projectName: currentProject?.name ?? 'Untitled',
        });
      } catch { /* ignore */ }
    }, 30_000);
  }, [autoSaveEnabled, projectId, canvasSize, currentProject]);

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      const fc = fabricRef.current;
      if (!fc) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const ctrl = e.ctrlKey || e.metaKey;

      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        const active = fc.getActiveObject();
        if (active) {
          const id = active.get('id') as string;
          fc.remove(active);
          if (id) removeObject(id);
          pushHistory('Delete', serializeCanvas(fc));
        }
      }
      if (ctrl && e.key === 'd') {
        e.preventDefault();
        const active = fc.getActiveObject();
        if (active) {
          const cloned = await active.clone();
          cloned.set({ left: active.left + 20, top: active.top + 20, id: crypto.randomUUID() });
          fc.add(cloned);
          fc.setActiveObject(cloned);
          fc.renderAll();
          addObject({ id: cloned.get('id') as string, type: 'text', name: 'Copy', visible: true, locked: false, opacity: 100, blendMode: 'normal' });
          pushHistory('Duplicate', serializeCanvas(fc));
        }
      }
      if (ctrl && e.key === '0') { e.preventDefault(); fitToScreen(); }
      if (ctrl && e.key === '1') { e.preventDefault(); setZoom(1); setPan(0, 0); }
      if (!ctrl && e.key === 'v') useToolStore.getState().setActiveTool('select');
      if (!ctrl && e.key === 't') useToolStore.getState().setActiveTool('text');
      if (!ctrl && e.key === 'i') useToolStore.getState().setActiveTool('image');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addObject, removeObject, pushHistory, fitToScreen, setZoom, setPan]);

  // ─── Ctrl+scroll zoom ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(zoom * (e.deltaY > 0 ? 0.9 : 1.1));
      } else {
        setPan(panX - e.deltaX, panY - e.deltaY);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, panX, panY, setZoom, setPan]);

  // ─── Pan drag ────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && activeTool === 'pan')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
      e.preventDefault();
    }
  }, [activeTool, panX, panY]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) setPan(e.clientX - dragStart.x, e.clientY - dragStart.y);
  }, [isDragging, dragStart, setPan]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  // ─── Click to add text ───────────────────────────────────────────────────────
  const onCanvasClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    const fc = fabricRef.current;
    if (!fc || activeTool !== 'text') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;

    const obj = await addTextToCanvas(fc, 'Double-click to edit', {
      left: x, top: y, originX: 'left', originY: 'top',
      fontFamily: textSettings.fontFamily,
      fontSize: textSettings.fontSize,
      fill: textSettings.color,
      fontWeight: textSettings.fontStyle.includes('bold') ? 'bold' : 'normal',
      fontStyle: textSettings.fontStyle.includes('italic') ? 'italic' : 'normal',
      textAlign: textSettings.textAlign,
      lineHeight: textSettings.lineHeight,
      charSpacing: textSettings.letterSpacing * 10,
    });

    addObject({ id: obj.get('id') as string, type: 'text', name: 'Text Layer', visible: true, locked: false, opacity: 100, blendMode: 'normal' });
    pushHistory('Add text', serializeCanvas(fc));
    setDirty(true);
  }, [activeTool, panX, panY, zoom, textSettings, addObject, pushHistory, setDirty]);

  // ─── Drop image ──────────────────────────────────────────────────────────────
  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const fc = fabricRef.current;
    if (!fc) return;
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    for (const file of files) {
      try {
        const img = await addImageToCanvas(fc, file);
        addObject({ id: img.get('id') as string, type: 'image', name: file.name, visible: true, locked: false, opacity: 100, blendMode: 'normal' });
      } catch { /* ignore */ }
    }
    if (files.length) pushHistory('Add image', serializeCanvas(fc));
  }, [addObject, pushHistory]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  const cursor = activeTool === 'pan' || isDragging ? 'grab' : activeTool === 'text' ? 'text' : 'default';

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden canvas-workspace"
      style={{ cursor }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={onCanvasClick}
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
    >
      {/* Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)`,
            backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
            backgroundPosition: `${panX}px ${panY}px`,
          }}
        />
      )}

      {/* Rulers */}
      {showRulers && (
        <>
          <div className="absolute top-0 left-6 right-0 h-6 bg-[var(--bg-surface)] border-b border-[var(--border)] z-10 overflow-hidden pointer-events-none">
            <svg width="100%" height="24">
              {Array.from({ length: 40 }).map((_, i) => {
                const x = i * 50 * zoom + panX;
                if (x < 0 || x > 2000) return null;
                return (
                  <g key={i}>
                    <line x1={x} y1={18} x2={x} y2={24} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                    <text x={x + 2} y={13} fontSize="8" fill="rgba(255,255,255,0.3)">{i * 50}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="absolute top-6 left-0 bottom-0 w-6 bg-[var(--bg-surface)] border-r border-[var(--border)] z-10 overflow-hidden pointer-events-none">
            <svg width="24" height="100%">
              {Array.from({ length: 40 }).map((_, i) => {
                const y = i * 50 * zoom + panY;
                if (y < 0 || y > 2000) return null;
                return (
                  <g key={i}>
                    <line x1={18} y1={y} x2={24} y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                    <text x={12} y={y + 2} fontSize="8" fill="rgba(255,255,255,0.3)" transform={`rotate(-90,12,${y + 2})`}>{i * 50}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </>
      )}

      {/* Fabric canvas wrapper */}
      <div
        className="absolute"
        style={{
          transform: `translate(${panX}px,${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
          left: showRulers ? 24 : 0,
          top: showRulers ? 24 : 0,
        }}
      >
        <div
          className="absolute inset-0"
          style={{ boxShadow: '0 8px 64px rgba(0,0,0,0.6)', pointerEvents: 'none' }}
        />
        <canvas ref={canvasElRef} />
      </div>

      <SmartGuides guides={guides} zoom={zoom} panX={panX} panY={panY} />
      <CanvasControls onFitToScreen={fitToScreen} />

      {/* Size badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-full text-xs text-[var(--text-muted)] pointer-events-none select-none">
        {canvasSize.width} × {canvasSize.height} {canvasSize.unit} · {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
