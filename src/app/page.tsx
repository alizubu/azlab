'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Type, Layers, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: <Type size={20} />,
    title: 'Advanced Typography',
    description: 'Adobe Illustrator-level text control with 1000+ fonts, effects, and multilingual support.',
  },
  {
    icon: <Layers size={20} />,
    title: 'Layer System',
    description: 'Full layer management with blend modes, opacity, and drag-to-reorder.',
  },
  {
    icon: <Sparkles size={20} />,
    title: 'Text Effects',
    description: 'Shadows, gradients, strokes, glows, 3D extrude, and more.',
  },
  {
    icon: <Download size={20} />,
    title: 'High-Res Export',
    description: 'Export up to 8K resolution in PNG, JPG, or WebP with transparency support.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] overflow-auto" data-theme="dark">
      {/* Header */}
      <header className="border-b border-[var(--border)] glass-strong sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">AZLab</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/projects">
              <Button variant="ghost" size="sm">Projects</Button>
            </Link>
            <Link href="/projects">
              <Button variant="gradient" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[var(--border)] text-xs text-[var(--text-muted)] mb-6">
            <Sparkles size={12} className="text-[var(--accent-primary)]" />
            Professional Creative Design Tool
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
            Design without
            <br />
            <span className="gradient-text">limits</span>
          </h1>

          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-10">
            AZLab combines Picsart-level UI polish with PixelLab editing power and Adobe Illustrator text control.
            Create stunning designs for social media, print, and beyond.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/projects">
              <Button variant="gradient" size="lg" iconRight={<ArrowRight size={16} />}>
                Start Designing
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="secondary" size="lg">
                Browse Templates
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 relative"
        >
          <div className="rounded-2xl glass border border-[var(--border)] overflow-hidden shadow-[0_0_80px_rgba(124,58,237,0.2)]">
            <div className="h-8 bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center gap-2 px-4">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 h-4 bg-[var(--bg-panel)] rounded-full" />
            </div>
            <div className="h-64 md:h-96 bg-[var(--bg-base)] flex items-center justify-center canvas-workspace">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-[var(--text-muted)] text-sm">Your canvas awaits</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl glass border border-[var(--border)] hover:border-[var(--accent-primary)] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-[rgba(124,58,237,0.15)] to-[rgba(6,182,212,0.15)] border border-[var(--border)]">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            Ready to create?
          </h2>
          <p className="text-[var(--text-muted)] mb-8">
            Start with a blank canvas or choose from our template library.
          </p>
          <Link href="/projects">
            <Button variant="gradient" size="lg" iconRight={<ArrowRight size={16} />}>
              Open Studio
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
