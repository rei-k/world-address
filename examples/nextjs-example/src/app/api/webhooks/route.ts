import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { webhookService } from '@/lib/services';
import { WebhookEvent } from '@/types';

/**
 * GET /api/webhooks
 * List all webhooks for the authenticated user
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const webhooks = webhookService.getAll(session.user.id);

  return NextResponse.json({
    webhooks,
    count: webhooks.length
  });
}

/**
 * POST /api/webhooks
 * Register a new webhook
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url, events, secret } = body as {
      url: string;
      events: WebhookEvent[];
      secret: string;
    };

    // Validate inputs
    if (!url || !events || !Array.isArray(events) || events.length === 0 || !secret) {
      return NextResponse.json(
        { error: 'Missing required fields: url, events, secret' },
        { status: 400 }
      );
    }

    const webhook = webhookService.register(url, events, session.user.id, secret);

    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
