import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  
}

export async function GET() {
  return Response.json({ ok: true });
}
