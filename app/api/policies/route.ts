export const runtime = "nodejs";

type Policy = {
  amountCapUsd: number;
  allowedCategories: string[];
  vendorWhitelist: string[];
  maxDaysOld: number;
};

let policy: Policy = {
  amountCapUsd: 100,
  allowedCategories: ["travel", "food", "supplies"],
  vendorWhitelist: [],
  maxDaysOld: 365,
};

export async function GET() {
  return Response.json({ policy });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const nextPolicy: Policy = {
    amountCapUsd:
      typeof body?.amountCapUsd === "number"
        ? body.amountCapUsd
        : policy.amountCapUsd,
    allowedCategories: Array.isArray(body?.allowedCategories)
      ? body.allowedCategories
      : policy.allowedCategories,
    vendorWhitelist: Array.isArray(body?.vendorWhitelist)
      ? body.vendorWhitelist
      : policy.vendorWhitelist,
    maxDaysOld:
      typeof body?.maxDaysOld === "number"
        ? body.maxDaysOld
        : policy.maxDaysOld,
  };
  policy = nextPolicy;
  return Response.json({ ok: true, policy });
}
