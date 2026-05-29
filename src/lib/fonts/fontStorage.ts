/**
 * IndexedDB font storage using Dexie.js
 * Persists uploaded fonts as ArrayBuffers for reload restoration
 */
import Dexie, { type Table } from 'dexie';

export interface StoredFont {
  id?: number;
  family: string;
  style: string;
  weight: number;
  format: 'ttf' | 'otf' | 'woff' | 'woff2';
  data: ArrayBuffer;
  scripts: string[];
  category: string;
  uploadedAt: number;
  usageCount: number;
}

class FontDatabase extends Dexie {
  fonts!: Table<StoredFont>;

  constructor() {
    super('AZLabFonts');
    this.version(1).stores({
      fonts: '++id, family, style, weight, uploadedAt',
    });
  }
}

let db: FontDatabase | null = null;

function getDB(): FontDatabase {
  if (!db) {
    db = new FontDatabase();
  }
  return db;
}

export async function saveFont(font: Omit<StoredFont, 'id'>): Promise<number> {
  const database = getDB();
  // Remove existing font with same family+style+weight
  await database.fonts
    .where('family')
    .equals(font.family)
    .and((f) => f.style === font.style && f.weight === font.weight)
    .delete();
  return database.fonts.add(font);
}

export async function getAllFonts(): Promise<StoredFont[]> {
  return getDB().fonts.orderBy('uploadedAt').reverse().toArray();
}

export async function deleteFont(id: number): Promise<void> {
  return getDB().fonts.delete(id);
}

export async function deleteFontByFamily(family: string): Promise<void> {
  await getDB().fonts.where('family').equals(family).delete();
}

export async function incrementUsage(family: string): Promise<void> {
  const fonts = await getDB().fonts.where('family').equals(family).toArray();
  for (const font of fonts) {
    if (font.id !== undefined) {
      await getDB().fonts.update(font.id, { usageCount: (font.usageCount || 0) + 1 });
    }
  }
}
