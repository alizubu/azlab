'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CANVAS_PRESETS, useProjectStore, type Project, type CanvasTemplate } from '@/store/projectStore';
import { Button } from '@/components/ui/Button';

function createProjectFromPreset(preset: CanvasTemplate): Project {
  const id = crypto.randomUUID();
  const now = Date.now();
  return {
    id,
    name: preset.name,
    createdAt: now,
    updatedAt: now,
    canvasWidth: preset.width,
    canvasHeight: preset.height,
    tags: [preset.category],
  };
}

export default function TemplatesPage() {
  const router = useRouter();
  const { addProject } = useProjectStore();

  const handleUseTemplate = (preset: CanvasTemplate) => {
    const project = createProjectFromPreset(preset);
    addProject(project);
    router.push(`/editor/${project.id}`);
  };

  const categories = [...new Set(CANVAS_PRESETS.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] overflow-auto" data-theme="dark">
      <header className="border-b border-[var(--border)] glass-strong sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">AZLab</span>
          </Link>
          <Link href="/projects">
            <Button variant="ghost" size="sm">My Projects</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Templates</h1>
          <p className="text-[var(--text-muted)]">Start with a pre-sized canvas for any platform or format.</p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-10">
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">{category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {CANVAS_PRESETS.filter((p) => p.category === category).map((preset, i) => (
                <motion.button
                  key={preset.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleUseTemplate(preset)}
                  className="group p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-primary)] transition-all text-left hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                >
                  <div
                    className="w-full bg-[var(--bg-panel)] rounded-lg mb-3 flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent-primary)] transition-colors"
                    style={{
                      aspectRatio: `${preset.width} / ${Math.min(preset.height, preset.width * 1.5)}`,
                      maxHeight: '100px',
                    }}
                  >
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {preset.width}×{preset.height}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {preset.width} × {preset.height} {preset.unit}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Use template <ArrowRight size={10} />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
