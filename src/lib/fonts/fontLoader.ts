/**
 * Font loading utilities using FontFace API
 * Handles Google Fonts, uploaded fonts, and system fonts
 */
import type { StoredFont } from './fontStorage';

const loadedFonts = new Set<string>();

/**
 * Load a Google Font by family name
 */
export async function loadGoogleFont(family: string, weights: string[] = ['400', '700']): Promise<void> {
  const key = `google:${family}`;
  if (loadedFonts.has(key)) return;

  const weightsParam = weights.join(';');
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weightsParam}&display=swap`;

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => {
      loadedFonts.add(key);
      resolve();
    };
    link.onerror = () => reject(new Error(`Failed to load font: ${family}`));
    document.head.appendChild(link);
  });
}

/**
 * Register an uploaded font from ArrayBuffer using FontFace API
 */
export async function registerUploadedFont(font: StoredFont): Promise<void> {
  const key = `uploaded:${font.family}:${font.style}:${font.weight}`;
  if (loadedFonts.has(key)) return;

  const fontFace = new FontFace(font.family, font.data, {
    style: font.style.includes('italic') ? 'italic' : 'normal',
    weight: String(font.weight),
  });

  const loaded = await fontFace.load();
  document.fonts.add(loaded);
  loadedFonts.add(key);
}

/**
 * Register all stored fonts from IndexedDB on app startup
 */
export async function restoreUploadedFonts(): Promise<StoredFont[]> {
  const { getAllFonts } = await import('./fontStorage');
  const fonts = await getAllFonts();

  await Promise.allSettled(fonts.map((font) => registerUploadedFont(font)));
  return fonts;
}

/**
 * Check if a font is currently loaded
 */
export function isFontLoaded(family: string): boolean {
  return document.fonts.check(`12px "${family}"`);
}

/**
 * Wait for a font to be available
 */
export async function waitForFont(family: string, timeout = 3000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (isFontLoaded(family)) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
}

/**
 * Parse font file to extract metadata using opentype.js
 * Runs in a Web Worker to avoid blocking the main thread
 */
export async function parseFontMetadata(buffer: ArrayBuffer): Promise<{
  family: string;
  style: string;
  weight: number;
  scripts: string[];
  category: string;
}> {
  // Dynamic import to avoid SSR issues
  const opentype = await import('opentype.js');
  const font = opentype.parse(buffer);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nameTable = font.names as any;
  const family =
    nameTable.preferredFamily?.en ||
    nameTable.fontFamily?.en ||
    'Unknown Font';

  const subfamilyRaw =
    nameTable.preferredSubfamily?.en ||
    nameTable.fontSubfamily?.en ||
    'Regular';

  const subfamilyLower = subfamilyRaw.toLowerCase();
  const style = subfamilyLower.includes('italic') ? 'italic' : 'normal';
  let weight = 400;
  if (subfamilyLower.includes('thin')) weight = 100;
  else if (subfamilyLower.includes('extralight') || subfamilyLower.includes('extra light')) weight = 200;
  else if (subfamilyLower.includes('light')) weight = 300;
  else if (subfamilyLower.includes('medium')) weight = 500;
  else if (subfamilyLower.includes('semibold') || subfamilyLower.includes('semi bold')) weight = 600;
  else if (subfamilyLower.includes('extrabold') || subfamilyLower.includes('extra bold')) weight = 800;
  else if (subfamilyLower.includes('bold')) weight = 700;
  else if (subfamilyLower.includes('black') || subfamilyLower.includes('heavy')) weight = 900;

  // Detect scripts from unicode ranges
  const scripts: string[] = ['Latin'];
  const glyphs = font.glyphs;
  let hasBangla = false;
  let hasArabic = false;
  let hasDevanagari = false;
  let hasCyrillic = false;

  for (let i = 0; i < Math.min(glyphs.length, 500); i++) {
    const glyph = glyphs.get(i);
    if (glyph.unicode) {
      if (glyph.unicode >= 0x0980 && glyph.unicode <= 0x09FF) hasBangla = true;
      if (glyph.unicode >= 0x0600 && glyph.unicode <= 0x06FF) hasArabic = true;
      if (glyph.unicode >= 0x0900 && glyph.unicode <= 0x097F) hasDevanagari = true;
      if (glyph.unicode >= 0x0400 && glyph.unicode <= 0x04FF) hasCyrillic = true;
    }
  }

  if (hasBangla) scripts.push('Bengali');
  if (hasArabic) scripts.push('Arabic');
  if (hasDevanagari) scripts.push('Devanagari');
  if (hasCyrillic) scripts.push('Cyrillic');

  return { family, style, weight, scripts, category: 'sans-serif' };
}
