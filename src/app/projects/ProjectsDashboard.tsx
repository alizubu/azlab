'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap, Search, Trash2, Copy, Edit3, Clock, Grid, List } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProjectStore, CANVAS_PRESETS, type Project } from '@/store/projectStore';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';

export function ProjectsDashboard() {
  const router = useRouter();
  const { projects, addProject, deleteProject, duplicateProject } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewProject = (preset: typeof CANVAS_PRESETS[0]) => {
    const id = crypto.randomUUID();
    const project: Project = {
      id,
      name: `${preset.name} — ${new Date().toLocaleDateString()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      canvasWidth: preset.width,
      canvasHeight: preset.height,
      tags: [preset.category],
    };
    addProject(project);
    setNewProjectOpen(false);
    router.push(`/editor/${id}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProject(id);
      toast.success('Project deleted');
    }
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateProject(id);
    toast.success(`Duplicated as "${copy.name}"`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]" data-theme="dark">
      {/* Header */}
      <header className="border-b border-[var(--border)] glass-strong sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">AZLab</span>
          </div>

          <nav className="flex items-center gap-1">
            <Link href="/projects">
              <Button variant="ghost" size="sm">Projects</Button>
            </Link>
            <Link href="/templates">
              <Button variant="ghost" size="sm">Templates</Button>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Projects</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <Button
            variant="gradient"
            icon={<Plus size={16} />}
            onClick={() => setNewProjectOpen(true)}
          >
            New Design
          </Button>
        </div>

        {/* Search + view toggle */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3 py-2">
            <Search size={15} className="text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx('p-1.5 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx('p-1.5 rounded-lg transition-colors', viewMode === 'list' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Projects grid/list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center mb-4">
              <Zap size={24} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first design to get started'}
            </p>
            {!searchQuery && (
              <Button variant="gradient" icon={<Plus size={16} />} onClick={() => setNewProjectOpen(true)}>
                Create Design
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onDelete={() => handleDelete(project.id, project.name)}
                onDuplicate={() => handleDuplicate(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((project, i) => (
              <ProjectListItem
                key={project.id}
                project={project}
                index={i}
                onDelete={() => handleDelete(project.id, project.name)}
                onDuplicate={() => handleDuplicate(project.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* New Project Modal */}
      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onSelect={handleNewProject}
      />
    </div>
  );
}

function ProjectCard({
  project,
  index,
  onDelete,
  onDuplicate,
}: {
  project: Project;
  index: number;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <Link href={`/editor/${project.id}`}>
        <div className="aspect-square rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden hover:border-[var(--accent-primary)] transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] cursor-pointer">
          {project.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgba(124,58,237,0.1)] to-[rgba(6,182,212,0.1)]">
              <div className="text-center">
                <div className="text-3xl mb-2">🎨</div>
                <p className="text-xs text-[var(--text-muted)]">
                  {project.canvasWidth}×{project.canvasHeight}
                </p>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Actions overlay */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.preventDefault(); onDuplicate(); }}
          className="w-6 h-6 rounded-md glass flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          title="Duplicate"
        >
          <Copy size={11} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onDelete(); }}
          className="w-6 h-6 rounded-md glass flex items-center justify-center text-[var(--text-muted)] hover:text-red-400"
          title="Delete"
        >
          <Trash2 size={11} />
        </button>
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-xs font-medium text-[var(--text-primary)] truncate">{project.name}</p>
        <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
          <Clock size={9} />
          {new Date(project.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
}

function ProjectListItem({
  project,
  index,
  onDelete,
  onDuplicate,
}: {
  project: Project;
  index: number;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-primary)] transition-all"
    >
      <Link href={`/editor/${project.id}`} className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[rgba(124,58,237,0.2)] to-[rgba(6,182,212,0.2)] flex items-center justify-center shrink-0">
          <span className="text-xl">🎨</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{project.name}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {project.canvasWidth}×{project.canvasHeight} · Updated {new Date(project.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onDuplicate} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]">
          <Copy size={14} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--bg-panel)]">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function NewProjectModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (preset: typeof CANVAS_PRESETS[0]) => void;
}) {
  const categories = [...new Set(CANVAS_PRESETS.map((p) => p.category))];
  const [activeCategory, setActiveCategory] = useState('Social');

  const filtered = CANVAS_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-2xl"
          aria-describedby="new-project-desc"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <Dialog.Title className="text-base font-semibold text-[var(--text-primary)]">
                New Design
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕</button>
              </Dialog.Close>
            </div>

            <div className="p-6" id="new-project-desc">
              {/* Category tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={clsx(
                      'px-3 py-1.5 text-xs rounded-full border transition-colors',
                      activeCategory === cat
                        ? 'border-[var(--accent-primary)] bg-[rgba(124,58,237,0.15)] text-[var(--accent-primary)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Presets grid */}
              <div className="grid grid-cols-3 gap-3">
                {filtered.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onSelect(preset)}
                    className="group p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border)] hover:border-[var(--accent-primary)] hover:bg-[rgba(124,58,237,0.05)] transition-all text-left"
                  >
                    <div
                      className="w-full bg-[var(--bg-surface)] rounded-lg mb-3 flex items-center justify-center border border-[var(--border)]"
                      style={{
                        aspectRatio: `${preset.width} / ${preset.height}`,
                        maxHeight: '80px',
                      }}
                    >
                      <span className="text-xs text-[var(--text-muted)]">
                        {preset.width}×{preset.height}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {preset.width} × {preset.height} {preset.unit}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
