import { NextRequest } from 'next/server';
import { POST as ingestPost, GET as ingestGet } from '../route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return ingestPost(req);
}

export async function GET() {
  return ingestGet();
}
