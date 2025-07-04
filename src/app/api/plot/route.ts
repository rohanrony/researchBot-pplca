import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { checkRateLimit } from '@/lib/redis/rateLimit';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export const GET = auth(async (req) => {
  // req.auth is the session object in Auth v5
  const session = req.auth;

  const identifier = session?.user?.email
    ? `user:${session.user.email}`
    : `ip:${req.headers.get('x-forwarded-for') ?? 'unknown'}`;

  // Temporary rate limit for the plot endpoint
  const limit = session ? 100 : 3;
  const allowed = await checkRateLimit(identifier, limit);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Plot rate limit exceeded' },
      { status: 429 },
    );
  }

  // Serve the static HTML file
  try {
    const filePath = path.join(process.cwd(), 'public', 'ibm_stock_2013.html');
    const html = await fs.readFile(filePath, 'utf-8');
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load plot' }, { status: 500 });
  }
});

import db from '@/lib/db';
import { messages as messagesSchema } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const POST = async (req: Request) => {
  console.debug('POST /plot request received');

  try {
    const body = await req.json();
    const { messageId, plotData } = body;

    // Validate required fields
    if (!messageId || !plotData) {
      return new Response('Missing messageId or plotData', { status: 400 });
    }

    // First, check if the record exists and get current metadata
    const existingRecord = await db
      .select({ metadata: messagesSchema.metadata })
      .from(messagesSchema)
      .where(eq(messagesSchema.messageId, messageId))
      .limit(1)
      .execute();

    if (existingRecord.length === 0) {
      return new Response('Message not found', { status: 404 });
    }

    // Prepare the new metadata - properly parse JSON string
    const currentMetadata = existingRecord[0].metadata
      ? typeof existingRecord[0].metadata === 'string'
        ? JSON.parse(existingRecord[0].metadata)
        : existingRecord[0].metadata
      : {};

    const updatedMetadata = {
      ...currentMetadata,
      plotData: plotData,
    };

    // Update with the merged metadata
    const result = await db
      .update(messagesSchema)
      .set({
        metadata: updatedMetadata,
      })
      .where(eq(messagesSchema.messageId, messageId))
      .returning({ metadata: messagesSchema.metadata })
      .execute();

    // console.debug('Database update result:', result);

    if (result.length > 0) {
      // console.debug('Updated metadata:', result[0].metadata);
      return new Response(null, { status: 204 });
    } else {
      return new Response('Update failed', { status: 500 });
    }
  } catch (err) {
    console.error('Failed to save plot data:', err);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
};
