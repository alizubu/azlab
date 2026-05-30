'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useFontStore, type FontMeta } from '@/store/fontStore';
import { saveFont } from '@/lib/fonts/fontStorage';
import { parseFontMetadata, registerUploadedFont } from '@/lib/fonts/fontLoader';

type UploadStatus = 'idle' | 'parsing' | 'success' | 'error';

interface UploadItem {
  name: string;
  status: UploadStatus;
  error?: string;
  family?: string;
}

export function FontUploader() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const { addUploadedFont } = useFontStore();

  const processFile = useCallback(
    async (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext ?? '')) {
        setUploads((prev) => [
          ...prev,
          { name: file.name, status: 'error', error: 'Unsupported format' },
        ]);
        return;
      }

      setUploads((prev) => [...prev, { name: file.name, status: 'parsing' }]);

      try {
        const buffer = await file.arrayBuffer();
        const meta = await parseFontMetadata(buffer.slice(0));

        const storedFont = {
          family: meta.family,
          style: meta.style,
          weight: meta.weight,
          format: ext as 'ttf' | 'otf' | 'woff' | 'woff2',
          data: buffer,
          scripts: meta.scripts,
          category: meta.category,
          uploadedAt: Date.now(),
          usageCount: 0,
        };

        await saveFont(storedFont);
        await registerUploadedFont(storedFont);

        addUploadedFont({
          family: meta.family,
          style: meta.style,
          weight: meta.weight,
          source: 'uploaded',
          scripts: meta.scripts,
          category: meta.category as FontMeta['category'],
          loaded: true,
        });

        setUploads((prev) =>
          prev.map((u) =>
            u.name === file.name
              ? { ...u, status: 'success', family: meta.family }
              : u
          )
        );
      } catch {
        setUploads((prev) =>
          prev.map((u) =>
            u.name === file.name
              ? { ...u, status: 'error', error: 'Failed to parse font' }
              : u
          )
        );
      }
    },
    [addUploadedFont]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      Array.from(files).forEach(processFile);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    [handleFiles]
  );

  return (
    <div className="p-3 space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer
          ${isDragOver
            ? 'border-[var(--accent-primary)] bg-[rgba(124,58,237,0.1)]'
            : 'border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-panel-hover)]'
          }
        `}
        onClick={() => document.getElementById('font-upload-input')?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload font files"
        onKeyDown={(e) => e.key === 'Enter' && document.getElementById('font-upload-input')?.click()}
      >
        <input
          id="font-upload-input"
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <Upload size={24} className="mx-auto mb-2 text-[var(--text-muted)]" />
        <p className="text-xs text-[var(--text-primary)] font-medium">Drop font files here</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">TTF, OTF, WOFF, WOFF2</p>
      </div>

      {/* Upload status */}
      <AnimatePresence>
        {uploads.map((upload, i) => (
          <motion.div
            key={`${upload.name}-${i}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)]"
          >
            {upload.status === 'parsing' && (
              <Loader2 size={14} className="text-[var(--accent-primary)] animate-spin shrink-0" />
            )}
            {upload.status === 'success' && (
              <CheckCircle size={14} className="text-green-400 shrink-0" />
            )}
            {upload.status === 'error' && (
              <AlertCircle size={14} className="text-red-400 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--text-primary)] truncate">{upload.name}</p>
              {upload.family && (
                <p className="text-[10px] text-[var(--text-muted)]">Loaded as: {upload.family}</p>
              )}
              {upload.error && (
                <p className="text-[10px] text-red-400">{upload.error}</p>
              )}
            </div>
            <button
              onClick={() => setUploads((prev) => prev.filter((_, j) => j !== i))}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Dismiss"
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
