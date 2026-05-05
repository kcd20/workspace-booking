import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Extract DSN from the envelope header to forward to the correct Sentry endpoint
  const pieces = body.split('\n');
  const header = JSON.parse(pieces[0]);
  const dsn = new URL(header.dsn);
  const projectId = dsn.pathname.replace('/', '');

  const upstream = `https://${dsn.hostname}/api/${projectId}/envelope/`;

  const response = await fetch(upstream, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
  });

  return new Response(await response.text(), { status: response.status });
}
