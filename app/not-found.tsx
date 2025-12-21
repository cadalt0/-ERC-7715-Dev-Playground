import Link from 'next/link';
import PlaygroundHeader from '@/components/PlaygroundHeader';

export default function NotFound() {
  return (
    <div className="app-container">
      <PlaygroundHeader />

      <main className="main">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="step-title" style={{ marginBottom: '0.75rem' }}>Page not found</div>
          <div className="step-description" style={{ marginBottom: '1.5rem' }}>
            The page you’re looking for doesn’t exist. You can go back to the dashboard and continue from there.
          </div>
          <Link href="/" className="primary-btn" style={{ display: 'inline-block' }}>
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
