export const runtime = "nodejs";

type AdvanceConfig = {
  creditLimitUsd: number;
  utilizationUsd: number;
  feeBps: number;
  enabled: boolean;
};

let config: AdvanceConfig = {
  creditLimitUsd: 10000,
  utilizationUsd: 0,
  feeBps: 150,
  enabled: true,
};

export async function GET() {
  return Response.json({ config });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  config = {
    creditLimitUsd:
      typeof body?.creditLimitUsd === "number"
        ? body.creditLimitUsd
        : config.creditLimitUsd,
    utilizationUsd:
      typeof body?.utilizationUsd === "number"
        ? body.utilizationUsd
        : config.utilizationUsd,
    feeBps: typeof body?.feeBps === "number" ? body.feeBps : config.feeBps,
    enabled: typeof body?.enabled === "boolean" ? body.enabled : config.enabled,
  };
  return Response.json({ ok: true, config });
}
