/**
 * Fabric.js initialization and configuration for AZLab
 * Uses a module-level registry to track canvas instances and prevent double-init.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FabricCanvas = any;

// Track canvas instances by their underlying HTMLCanvasElement
const canvasRegistry = new WeakMap<HTMLCanvasElement, FabricCanvas>();

export interface FabricSetupOptions {
  canvasEl: HTMLCanvasElement;
  width: number;
  height: number;
  onObjectSelected?: (obj: FabricCanvas | null) => void;
  onObjectModified?: (obj: FabricCanvas) => void;
  onCanvasModified?: () => void;
}

/**
 * Initialize a Fabric.js canvas with AZLab defaults.
 * Safely disposes any existing instance on the same element first.
 */
export async function initFabricCanvas(options: FabricSetupOptions): Promise<FabricCanvas> {
  const { Canvas, FabricObject } = await import('fabric');

  // Dispose any existing canvas on this element
  const existing = canvasRegistry.get(options.canvasEl);
  if (existing) {
    try {
      existing.dispose();
    } catch {
      // ignore
    }
    canvasRegistry.delete(options.canvasEl);
  }

  const canvas = new Canvas(options.canvasEl, {
    width: options.width,
    height: options.height,
    backgroundColor: '#ffffff',   // white canvas so dark text is visible
    selection: true,
    preserveObjectStacking: true,
    renderOnAddRemove: true,
    stopContextMenu: true,
    fireRightClick: true,
    controlsAboveOverlay: true,
  });

  // Register this instance
  canvasRegistry.set(options.canvasEl, canvas);

  // Configure default control appearance
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

  // Event listeners
  canvas.on('selection:created', (e: FabricCanvas) => {
    options.onObjectSelected?.(e.selected?.[0] ?? null);
  });
  canvas.on('selection:updated', (e: FabricCanvas) => {
    options.onObjectSelected?.(e.selected?.[0] ?? null);
  });
  canvas.on('selection:cleared', () => {
    options.onObjectSelected?.(null);
  });
  canvas.on('object:modified', (e: FabricCanvas) => {
    options.onObjectModified?.(e.target);
    options.onCanvasModified?.();
  });
  canvas.on('object:added', () => {
    options.onCanvasModified?.();
  });
  canvas.on('object:removed', () => {
    options.onCanvasModified?.();
  });

  return canvas;
}

/**
 * Safely resize a Fabric canvas. Works with Fabric v5 and v6.
 */
export function resizeFabricCanvas(canvas: FabricCanvas, width: number, height: number): void {
  if (!canvas) return;
  // Fabric v6 uses setWidth/setHeight; v5 uses setDimensions
  if (typeof canvas.setWidth === 'function') {
    canvas.setWidth(width);
    canvas.setHeight(height);
  } else if (typeof canvas.setDimensions === 'function') {
    canvas.setDimensions({ width, height });
  }
  canvas.renderAll();
}

/** Serialize canvas to JSON string */
export function serializeCanvas(canvas: FabricCanvas): string {
  if (!canvas) return '{}';
  return JSON.stringify(canvas.toJSON(['id', 'name', 'selectable', 'evented']));
}

/** Load canvas state from JSON string */
export async function loadCanvasFromJSON(canvas: FabricCanvas, json: string): Promise<void> {
  return new Promise((resolve) => {
    canvas.loadFromJSON(JSON.parse(json), () => {
      canvas.renderAll();
      resolve();
    });
  });
}

/** Export canvas as a data URL */
export function exportCanvasAsDataURL(
  canvas: FabricCanvas,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality = 1,
  multiplier = 1
): string {
  return canvas.toDataURL({ format, quality, multiplier });
}

/** Add an IText object to the canvas */
export async function addTextToCanvas(
  canvas: FabricCanvas,
  text: string,
  options: Record<string, unknown> = {}
): Promise<FabricCanvas> {
  const { IText } = await import('fabric');

  const textObj = new IText(text, {
    left: canvas.width / 2,
    top: canvas.height / 2,
    originX: 'center',
    originY: 'center',
    fontFamily: 'Inter',
    fontSize: 48,
    fill: '#1a1a2e',          // dark by default — visible on white canvas
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    lineHeight: 1.2,
    charSpacing: 0,
    ...options,
    id: crypto.randomUUID(),
    name: 'Text Layer',
  });

  canvas.add(textObj);
  canvas.setActiveObject(textObj);
  canvas.renderAll();
  return textObj;
}

/** Add an image to the canvas from a URL or File */
export async function addImageToCanvas(
  canvas: FabricCanvas,
  source: string | File
): Promise<FabricCanvas> {
  const { FabricImage } = await import('fabric');

  const url = source instanceof File ? URL.createObjectURL(source) : source;
  const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });

  const maxW = canvas.width * 0.8;
  const maxH = canvas.height * 0.8;
  const scale = Math.min(maxW / (img.width ?? 1), maxH / (img.height ?? 1), 1);

  img.set({
    left: canvas.width / 2,
    top: canvas.height / 2,
    originX: 'center',
    originY: 'center',
    scaleX: scale,
    scaleY: scale,
    id: crypto.randomUUID(),
    name: 'Image Layer',
  });

  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.renderAll();
  return img;
}
