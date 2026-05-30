'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useToolStore } from '@/store/toolStore';
import { useProjectStore } from '@/store/projectStore';
import {
  initFabricCanvas, resizeFabricCanvas,
  addTextToCanvas, addImageToCanvas, serializeCanvas,
} from '@/lib/canvas/fabricSetup';
import { saveDraft, loadDraft } from '@/lib/canvas/canvasSerialization';
import { CanvasControls } from './CanvasControls';

interface CanvasWorkspaceProps { projectId: string }

export function CanvasWorkspace({ projectId }: CanvasWorkspaceProps) {
  const canvasElRef  = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef    = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initRef      = useRef(false);

  const {
    canvasSize, zoom, setZoom, panX, panY, setPan,
    setFabricCanvas, setSelectedIds,
    addObject, removeObject, pushHistory,
    showGrid, gridSize, showRulers,
  } = useCanvasStore();

  const { activeTool, textSettings } = useToolStore();
  const { currentProject, setDirty, autoSaveEnabled } = useProjectStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart,  setDragStart]  = useState({ x: 0, y: 0 });

  // ── Fit canvas to container ──────────────────────────────────────────────────
  const fitToScreen = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const { width: cw, height: ch } = c.getBoundingClientRect();
    const pad = 60;
    const z = Math.min((cw - pad * 2) / canvasSize.width, (ch - pad * 2) / canvasSize.height, 1);
    setZoom(z);
    setPan((cw - canvasSize.width * z) / 2, (ch - canvasSize.height * z) / 2);
  }, [canvasSize.width, canvasSize.height, setZoom, setPan]);

  // ── Init Fabric.js ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (initRef.current) return;
    const el = canvasElRef.current;
    if (!el) return;

    initRef.current = true;

    initFabricCanvas({
      canvasEl: el,
      width: canvasSize.width,
      height: canvasSize.height,
      onObjectSelected: (obj) => {
        setSelectedIds(obj ? [String(obj.get?.('id') ?? '')].filter(Boolean) : []);
      },
      onObjectModified: () => setDirty(true),
      onCanvasModified: () => setDirty(true),
    }).then((canvas) => {
      fabricRef.current = canvas;
      setFabricCanvas(canvas);

      // Restore saved draft if one exists
      const draft = loadDraft(projectId);
      if (draft) {
        try {
          canvas.loadFromJSON(JSON.parse(draft.json), () => {
            canvas.renderAll();
            pushHistory('Restored draft', serializeCanvas(canvas));
            setTimeout(fitToScreen, 50);
          });
        } catch {
          pushHistory('Canvas created', serializeCanvas(canvas));
          setTimeout(fitToScreen, 100);
        }
      } else {
        pushHistory('Canvas created', serializeCanvas(canvas));
        setTimeout(fitToScreen, 100);
      }
    }).catch((err) => {
      console.error('Fabric init error:', err);
      initRef.current = false;
    });

    return () => {
      initRef.current = false;
      if (fabricRef.current) {
        try { fabricRef.current.dispose(); } catch { /* ignore */ }
        fabricRef.current = null;
        setFabricCanvas(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resize when canvas size changes ─────────────────────────────────────────
  useEffect(() => {
    if (fabricRef.current) {
      resizeFabricCanvas(fabricRef.current, canvasSize.width, canvasSize.height);
    }
  }, [canvasSize.width, canvasSize.height]);

  // ── Auto-save every 30s ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoSaveEnabled) return;
    const id = setInterval(() => {
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
    return () => clearInterval(id);
  }, [autoSaveEnabled, projectId, canvasSize, currentProject]);

  // ── Image upload ─────────────────────────────────────────────────────────────
  const handleImageFiles = useCallback(async (files: FileList | File[]) => {
    const fc = fabricRef.current;
    if (!fc) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const img = await addImageToCanvas(fc, file);
        addObject({
          id: String(img.get('id')), type: 'image', name: file.name,
          visible: true, locked: false, opacity: 100, blendMode: 'normal',
        });
      } catch { /* ignore */ }
    }
    pushHistory('Add image', serializeCanvas(fc));
    setDirty(true);
    useToolStore.getState().setActiveTool('select');
  }, [addObject, pushHistory, setDirty]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const fc  = fabricRef.current;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const ctrl = e.ctrlKey || e.metaKey;

      if (fc && (e.key === 'Delete' || e.key === 'Backspace')) {
        const active = fc.getActiveObject?.();
        if (active) {
          const id = String(active.get?.('id') ?? '');
          fc.remove(active);
          if (id) removeObject(id);
          pushHistory('Delete', serializeCanvas(fc));
        }
      }
      if (fc && ctrl && e.key === 'd') {
        e.preventDefault();
        const active = fc.getActiveObject?.();
        if (active) {
          const cloned = await active.clone();
          cloned.set({ left: active.left + 20, top: active.top + 20, id: crypto.randomUUID() });
          fc.add(cloned); fc.setActiveObject(cloned); fc.renderAll();
          addObject({ id: String(cloned.get('id')), type: 'text', name: 'Copy', visible: true, locked: false, opacity: 100, blendMode: 'normal' });
          pushHistory('Duplicate', serializeCanvas(fc));
        }
      }
      if (ctrl && e.key === '0') { e.preventDefault(); fitToScreen(); }
      if (ctrl && e.key === '1') { e.preventDefault(); setZoom(1); setPan(0, 0); }
      if (!ctrl && e.key === 'v') useToolStore.getState().setActiveTool('select');
      if (!ctrl && e.key === 't') useToolStore.getState().setActiveTool('text');
      if (!ctrl && e.key === 'i') fileInputRef.current?.click();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [addObject, removeObject, pushHistory, fitToScreen, setZoom, setPan]);

  // ── Ctrl+scroll zoom ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(Math.max(0.05, Math.min(10, zoom * (e.deltaY > 0 ? 0.9 : 1.1))));
      } else {
        setPan(panX - e.deltaX, panY - e.deltaY);
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [zoom, panX, panY, setZoom, setPan]);

  // ── Pan drag ─────────────────────────────────────────────────────────────────
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

  // ── Click to add text / open image picker ────────────────────────────────────
  const onCanvasClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    const fc = fabricRef.current;
    if (!fc) return;

    if (activeTool === 'image') {
      fileInputRef.current?.click();
      return;
    }

    if (activeTool !== 'text') return;

    // Don't create text if clicking an existing object
    const hit = fc.findTarget?.(e.nativeEvent);
    if (hit) return;

    const rulerOff = showRulers ? 24 : 0;
    const rect = containerRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left - rulerOff - panX) / zoom;
    const y = (e.clientY - rect.top  - rulerOff - panY) / zoom;

    const obj = await addTextToCanvas(fc, 'Double-click to edit', {
      left: x, top: y, originX: 'left', originY: 'top',
      fontFamily: textSettings.fontFamily,
      fontSize:   textSettings.fontSize,
      fill:       '#1a1a2e',
      fontWeight: textSettings.fontStyle.includes('bold')   ? 'bold'   : 'normal',
      fontStyle:  textSettings.fontStyle.includes('italic') ? 'italic' : 'normal',
      textAlign:  textSettings.textAlign,
      lineHeight: textSettings.lineHeight,
      charSpacing: textSettings.letterSpacing * 10,
    });

    addObject({
      id: String(obj.get('id')), type: 'text', name: 'Text Layer',
      visible: true, locked: false, opacity: 100, blendMode: 'normal',
    });
    pushHistory('Add text', serializeCanvas(fc));
    setDirty(true);
    useToolStore.getState().setActiveTool('select');
  }, [activeTool, panX, panY, zoom, showRulers, textSettings, addObject, pushHistory, setDirty]);

  // ── Drop image ───────────────────────────────────────────────────────────────
  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) await handleImageFiles(files);
  }, [handleImageFiles]);

  const cursor =
    isDragging           ? 'grabbing' :
    activeTool === 'pan'   ? 'grab'   :
    activeTool === 'text'  ? 'text'   :
    activeTool === 'image' ? 'copy'   : 'default';

  const rulerOff = showRulers ? 24 : 0;

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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file" accept="image/*" multiple className="hidden"
        onChange={e => { if (e.target.files) handleImageFiles(e.target.files); e.target.value = ''; }}
      />

      {/* Grid overlay */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)`,
          backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
          backgroundPosition: `${panX}px ${panY}px`,
        }} />
      )}

      {/* Rulers */}
      {showRulers && (
        <>
          <div className="absolute top-0 left-6 right-0 h-6 bg-[var(--bg-surface)] border-b border-[var(--border)] z-10 overflow-hidden pointer-events-none">
            <svg width="100%" height="24">
              {Array.from({ length: 60 }).map((_, i) => {
                const x = i * 50 * zoom + panX;
                if (x < 0 || x > 4000) return null;
                return (
                  <g key={i}>
                    <line x1={x} y1={18} x2={x} y2={24} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
                    <text x={x + 2} y={13} fontSize="8" fill="rgba(255,255,255,0.35)">{i * 50}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="absolute top-6 left-0 bottom-0 w-6 bg-[var(--bg-surface)] border-r border-[var(--border)] z-10 overflow-hidden pointer-events-none">
            <svg width="24" height="100%">
              {Array.from({ length: 60 }).map((_, i) => {
                const y = i * 50 * zoom + panY;
                if (y < 0 || y > 4000) return null;
                return (
                  <g key={i}>
                    <line x1={18} y1={y} x2={24} y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
                    <text x={12} y={y + 2} fontSize="8" fill="rgba(255,255,255,0.35)" transform={`rotate(-90,12,${y + 2})`}>{i * 50}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </>
      )}

      {/* Fabric canvas — positioned with CSS transform for zoom/pan */}
      <div
        className="absolute"
        style={{
          left: rulerOff,
          top: rulerOff,
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Drop shadow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: -1,
          boxShadow: '0 4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
          pointerEvents: 'none',
        }} />
        <canvas ref={canvasElRef} />
      </div>

      <CanvasControls onFitToScreen={fitToScreen} />

      {/* Size badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-full text-xs text-[var(--text-muted)] pointer-events-none select-none">
        {canvasSize.width} × {canvasSize.height} {canvasSize.unit} · {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
