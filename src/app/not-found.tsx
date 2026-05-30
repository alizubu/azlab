import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6">🎨</div>
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">404</h1>
        <p className="text-[var(--text-muted)] mb-8">This canvas doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Back to AZLab
        </Link>
      </div>
    </div>
  );
}
