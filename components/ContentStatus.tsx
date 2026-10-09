'use client';

export default function ContentStatus({ children, error = false, onRetry, retryLabel = 'Try again' }: {
  children: React.ReactNode; error?: boolean; onRetry?: () => void; retryLabel?: string;
}) {
  return <div className={`content-status${error ? ' content-status-error' : ''}`} role={error ? 'alert' : 'status'}>
    <p>{children}</p>
    {onRetry && <button type="button" onClick={onRetry}>{retryLabel}</button>}
  </div>;
}
