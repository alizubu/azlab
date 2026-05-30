/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Fabric.js canvas setup — AZLab
 */

export type FabricCanvas = any;

// Prevent double-init when the same HTMLCanvasElement is reused (StrictMode, hot reload)
const canvasRegistry = new WeakMap<HTMLCanvasElement, FabricCanvas>();

export interface FabricSetupOptions {
  canvasEl: HTMLCanvasElement;
  width: number;
  height: number;
  onObjectSelected?: (obj: FabricCanvas | null) => void;
  onObjectModified?: () => void;
  onCanvasModified?: () => void;
}

export async function initFabricCanvas(options: FabricSetupOptions): Promise<FabricCanvas> {
  const { Canvas, FabricObject } = await import('fabric');

  // Dispose any stale instance on this element before creating a new one
  const existing = canvasRegistry.get(options.canvasEl);
  if (existing) {
    try { existing.dispose(); } catch { /* ignore */ }
    canvasRegistry.delete(options.canvasEl);
  }

  const canvas = new Canvas(options.canvasEl, {
    width: options.width,
    height: options.height,
    backgroundColor: '#ffffff',
    selection: true,
    preserveObjectStacking: true,
    renderOnAddRemove: true,
    stopContextMenu: true,
    fireRightClick: true,
    controlsAboveOverlay: true,
  });

  canvasRegistry.set(options.canvasEl, canvas);

  if (FabricObject) {
    FabricObject.prototype.cornerColor = '#7c3aed';
    FabricObject.prototype.cornerStrokeColor = '#ffffff';
    FabricObject.prototype.cornerSize = 10;
    FabricObject.prototype.cornerStyle = 'circle';
    FabricObject.prototype.transparentCorners = false;
    FabricObject.prototype.borderColor = '#7c3aed';
    FabricObject.prototype.borderScaleFactor = 1.5;
    FabricObject.prototype.padding = 4;
  }

  canvas.on('selection:created',  (e: any) => options.onObjectSelected?.(e.selected?.[0] ?? null));
  canvas.on('selection:updated',  (e: any) => options.onObjectSelected?.(e.selected?.[0] ?? null));
  canvas.on('selection:cleared',  ()       => options.onObjectSelected?.(null));
  canvas.on('object:modified',    ()       => options.onObjectModified?.());
  canvas.on('object:added',       ()       => options.onCanvasModified?.());
  canvas.on('object:removed',     ()       => options.onCanvasModified?.());

  return canvas;
}

export function resizeFabricCanvas(canvas: FabricCanvas, w: number, h: number): void {
  if (!canvas) return;
  try {
    if (typeof canvas.setWidth === 'function') {
      canvas.setWidth(w);
      canvas.setHeight(h);
    } else if (typeof canvas.setDimensions === 'function') {
      canvas.setDimensions({ width: w, height: h });
    }
    canvas.renderAll();
  } catch { /* ignore */ }
}

export function serializeCanvas(canvas: FabricCanvas): string {
  if (!canvas) return '{}';
  try { return JSON.stringify(canvas.toJSON(['id', 'name'])); } catch { return '{}'; }
}

export async function addTextToCanvas(
  canvas: FabricCanvas,
  text: string,
  opts: Record<string, unknown> = {}
): Promise<FabricCanvas> {
  const { IText } = await import('fabric');
  const obj = new IText(text, {
    left: canvas.width / 2,
    top: canvas.height / 2,
    originX: 'center',
    originY: 'center',
    fontFamily: 'Inter',
    fontSize: 48,
    fill: '#1a1a2e',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    lineHeight: 1.2,
    charSpacing: 0,
    ...opts,
    id: crypto.randomUUID(),
    name: 'Text Layer',
  });
  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.renderAll();
  return obj;
}

export async function addImageToCanvas(
  canvas: FabricCanvas,
  source: string | File
): Promise<FabricCanvas> {
  const { FabricImage } = await import('fabric');
  const url = source instanceof File ? URL.createObjectURL(source) : source;
  const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
  const scale = Math.min(
    (canvas.width * 0.8) / (img.width ?? 1),
    (canvas.height * 0.8) / (img.height ?? 1),
    1
  );
  img.set({
    left: canvas.width / 2, top: canvas.height / 2,
    originX: 'center', originY: 'center',
    scaleX: scale, scaleY: scale,
    id: crypto.randomUUID(), name: 'Image Layer',
  });
  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.renderAll();
  return img;
}
