/**
 * Canvas serialization and persistence utilities
 */

const DRAFT_KEY = 'azlab_draft';
const DRAFT_META_KEY = 'azlab_draft_meta';

export interface DraftMeta {
  projectId: string;
  savedAt: number;
  canvasWidth: number;
  canvasHeight: number;
  projectName: string;
}

/**
 * Save canvas draft to localStorage
 */
export function saveDraft(projectId: string, canvasJSON: string, meta: Omit<DraftMeta, 'savedAt'>): void {
  try {
    localStorage.setItem(`${DRAFT_KEY}_${projectId}`, canvasJSON);
    localStorage.setItem(`${DRAFT_META_KEY}_${projectId}`, JSON.stringify({
      ...meta,
      savedAt: Date.now(),
    }));
  } catch {
    // localStorage might be full
    console.warn('Failed to save draft to localStorage');
  }
}

/**
 * Load canvas draft from localStorage
 */
export function loadDraft(projectId: string): { json: string; meta: DraftMeta } | null {
  try {
    const json = localStorage.getItem(`${DRAFT_KEY}_${projectId}`);
    const metaStr = localStorage.getItem(`${DRAFT_META_KEY}_${projectId}`);
    if (!json || !metaStr) return null;
    return { json, meta: JSON.parse(metaStr) };
  } catch {
    return null;
  }
}

/**
 * Clear draft from localStorage
 */
export function clearDraft(projectId: string): void {
  localStorage.removeItem(`${DRAFT_KEY}_${projectId}`);
  localStorage.removeItem(`${DRAFT_META_KEY}_${projectId}`);
}

/**
 * Get all draft project IDs
 */
export function getAllDraftIds(): string[] {
  const ids: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(DRAFT_META_KEY + '_')) {
      ids.push(key.replace(DRAFT_META_KEY + '_', ''));
    }
  }
  return ids;
}

/**
 * Export canvas as .canvasflow file (JSON)
 */
export function exportAsCanvasFlow(
  canvasJSON: string,
  projectName: string,
  canvasWidth: number,
  canvasHeight: number
): void {
  const data = {
    version: '1.0',
    app: 'AZLab',
    exportedAt: new Date().toISOString(),
    project: { name: projectName, canvasWidth, canvasHeight },
    canvas: JSON.parse(canvasJSON),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.replace(/\s+/g, '_')}.canvasflow`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import a .canvasflow file
 */
export async function importCanvasFlow(file: File): Promise<{
  canvasJSON: string;
  projectName: string;
  canvasWidth: number;
  canvasHeight: number;
}> {
  const text = await file.text();
  const data = JSON.parse(text);

  if (data.app !== 'AZLab') {
    throw new Error('Invalid .canvasflow file');
  }

  return {
    canvasJSON: JSON.stringify(data.canvas),
    projectName: data.project.name,
    canvasWidth: data.project.canvasWidth,
    canvasHeight: data.project.canvasHeight,
  };
}
