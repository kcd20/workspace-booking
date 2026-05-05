'use client';

import * as Sentry from '@sentry/nextjs';

export default function SentryTestPage() {
  return (
    <div style={{ padding: 48, fontFamily: 'Arial, sans-serif' }}>
      <h1>Sentry Test</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Use these buttons to verify Sentry is receiving events.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => Sentry.captureMessage('Test message from FlowSpace')}
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
