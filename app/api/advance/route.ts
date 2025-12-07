export const runtime = "nodejs";

type Decision = {
  approved: boolean;
  reason?: string;
  feeUsd?: number;
};

let state = {
  creditLimitUsd: 10000,
  utilizationUsd: 0,
  feeBps: 150,
  enabled: true,
};

export async function GET() {
  return Response.json({ config: state });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const amountUsd = typeof body?.amountUsd === "number" ? body.amountUsd : 0;
  const enabled = state.enabled;
  const nextUtilization = state.utilizationUsd + amountUsd;
  if (!enabled) {
    const d: Decision = { approved: false, reason: "advance_disabled" };
    return Response.json({ ok: true, decision: d });
  }
  if (amountUsd <= 0) {
    const d: Decision = { approved: false, reason: "invalid_amount" };
    return Response.json({ ok: false, decision: d }, { status: 400 });
  }
  if (nextUtilization > state.creditLimitUsd) {
    const d: Decision = { approved: false, reason: "limit_exceeded" };
    return Response.json({ ok: true, decision: d });
  }
  const feeUsd = (amountUsd * state.feeBps) / 10000;
  const d: Decision = { approved: true, feeUsd };
  return Response.json({ ok: true, decision: d });
}
