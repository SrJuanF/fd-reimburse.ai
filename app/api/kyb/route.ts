export const runtime = "nodejs";

type KYBStatus = "unsubmitted" | "pending" | "approved" | "rejected";

type KYBData = {
  companyName?: string;
  registrationNumber?: string;
  country?: string;
  contactEmail?: string;
  bankAccountLast4?: string;
};

let kybStatus: KYBStatus = "unsubmitted";
let kybData: KYBData = {};

export async function GET() {
  return Response.json({ status: kybStatus, data: kybData });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  kybData = {
    companyName:
      typeof body?.companyName === "string"
        ? body.companyName
        : kybData.companyName,
    registrationNumber:
      typeof body?.registrationNumber === "string"
        ? body.registrationNumber
        : kybData.registrationNumber,
    country: typeof body?.country === "string" ? body.country : kybData.country,
    contactEmail:
      typeof body?.contactEmail === "string"
        ? body.contactEmail
        : kybData.contactEmail,
    bankAccountLast4:
      typeof body?.bankAccountLast4 === "string"
        ? body.bankAccountLast4
        : kybData.bankAccountLast4,
  };
  kybStatus = "pending";
  return Response.json({ ok: true, status: kybStatus, data: kybData });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  const decision =
    body?.decision === "approved"
      ? "approved"
      : body?.decision === "rejected"
      ? "rejected"
      : null;
  if (!decision) {
    return Response.json(
      { ok: false, error: "invalid_decision" },
      { status: 400 }
    );
  }
  kybStatus = decision as KYBStatus;
  return Response.json({ ok: true, status: kybStatus });
}
