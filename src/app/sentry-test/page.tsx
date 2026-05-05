'use client';

import * as Sentry from '@sentry/nextjs';

export default function SentryTestPage() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const client = Sentry.getClient();

  return (
    <div style={{ padding: 48, fontFamily: 'Arial, sans-serif' }}>
      <h1>Sentry Test</h1>
      <p style={{ marginBottom: 8 }}>DSN set: <strong>{dsn ? 'yes' : 'NO — missing NEXT_PUBLIC_SENTRY_DSN'}</strong></p>
      <p style={{ marginBottom: 24 }}>Sentry client: <strong>{client ? 'initialized' : 'NOT initialized'}</strong></p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => {
            const id = Sentry.captureMessage('Test message from FlowSpace');
            alert(`Sent! Event ID: ${id}`);
          }}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Send Test Message
        </button>
        <button
          onClick={() => { throw new Error('Test error from FlowSpace'); }}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Throw Test Error
        </button>
      </div>
    </div>
  );
}
