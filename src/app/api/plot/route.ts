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
    console.debug('Request body parsed:', body);
    const { messageId, plotData } = body;
    console.debug('Updating message with ID:', messageId, 'with plotData:', plotData);
    
    const result = await db
      .update(messagesSchema)
      .set({
        metadata: sql`json_set(metadata, '$.plotData', ${plotData})`,
      })
      .where(eq(messagesSchema.messageId, messageId))
      .execute();
      
    console.debug('Database update result:', result);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('Failed to save plot data:', err);
    return new Response('Error', { status: 500 });
  }
};
