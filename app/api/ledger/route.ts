export const runtime = "nodejs";

type LedgerEntry = {
  id: string;
  employee: string;
  amountUsd: number;
  feeUsd: number;
  type: "advance" | "company";
  status: "pending" | "settled";
  timestamp: number;
};

let ledger: LedgerEntry[] = [];

export async function GET() {
  return Response.json({ entries: ledger });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const entry: LedgerEntry = {
    id:
      typeof body?.id === "string"
        ? body.id
        : Math.random().toString(36).slice(2),
    employee: typeof body?.employee === "string" ? body.employee : "",
    amountUsd: typeof body?.amountUsd === "number" ? body.amountUsd : 0,
    feeUsd: typeof body?.feeUsd === "number" ? body.feeUsd : 0,
    type: body?.type === "advance" ? "advance" : "company",
    status: body?.status === "settled" ? "settled" : "pending",
    timestamp: Date.now(),
  };
  ledger.push(entry);
  return Response.json({ ok: true, entry });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : "";
  const nextStatus =
    body?.status === "settled"
      ? "settled"
      : body?.status === "pending"
      ? "pending"
      : null;
  if (!id || !nextStatus) {
    return Response.json(
      { ok: false, error: "invalid_update" },
      { status: 400 }
    );
  }
  const idx = ledger.findIndex((e) => e.id === id);
  if (idx === -1) {
    return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  ledger[idx].status = nextStatus;
  return Response.json({ ok: true, entry: ledger[idx] });
}
