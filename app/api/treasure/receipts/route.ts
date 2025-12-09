import { NextRequest } from "next/server";
import { serverCompanyWalletAddress } from "@/lib/thirdweb.server";
import { paymentToken, paymentChain, API_BASE_URL } from "@/lib/constants";
//import { wrapFetchWithPayment } from "thirdweb/x402";
/*const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);
  const response = await fetchWithPay("/api/auditor");
  const data = await response.json();
  console.log(data);*/

export const runtime = "nodejs";

type ReceiptHistoryItem = {
  id: string;
  employee?: string;
  fileName?: string;
  size?: number;
  reimbursementValid: boolean;
  decisionReason?: string;
  ok: boolean;
  transactionHash?: string;
  timestamp: number;
};

const RECEIPT_HISTORY: ReceiptHistoryItem[] = [];

function isEvmAddress(s: unknown): s is string {
  return typeof s === "string" && /^0x[0-9a-fA-F]{40}$/.test(s);
}

function validateIncomingForm(form: FormData) {
  const file = form.get("file");
  const employee = form.get("employee");
  if (!(file instanceof Blob)) {
    throw new Error("Invalid or missing file");
  }
  const type = (file as File).type || "";
  if (!type.startsWith("image/")) {
    throw new Error("File must be an image");
  }
  if (!isEvmAddress(employee)) {
    throw new Error("Invalid employee address");
  }
  return { file: file as File, employee };
}

function appendReceiptHistory(
  incomingFile: File | Blob | null,
  incomingAddress: unknown,
  data: unknown,
  reimburseData: unknown
) {
  const fileName =
    incomingFile && typeof (incomingFile as File).name === "string"
      ? (incomingFile as File).name
      : undefined;
  const size =
    incomingFile && typeof (incomingFile as File).size === "number"
      ? (incomingFile as File).size
      : undefined;
  const reimbursementValid = Boolean((data as any)?.reimbursementValid);
  const decisionReason =
    typeof (data as any)?.decisionReason === "string"
      ? (data as any).decisionReason
      : undefined;
  const ok = Boolean((reimburseData as any)?.ok);
  const transactionHash =
    typeof (reimburseData as any)?.transactionHash === "string"
      ? (reimburseData as any).transactionHash
      : undefined;

  const record: ReceiptHistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    employee: isEvmAddress(incomingAddress) ? incomingAddress : undefined,
    fileName,
    size,
    reimbursementValid,
    decisionReason,
    ok,
    transactionHash,
    timestamp: Date.now(),
  };

  RECEIPT_HISTORY.unshift(record);
  return record;
}

function onSuccess(record: ReceiptHistoryItem) {
  return record;
}

function onError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return { error: message };
}

export async function GET() {
  return Response.json({ receipts: RECEIPT_HISTORY });
}

export async function POST(request: NextRequest) {
  const incomingForm = await request.formData();
  let validated: { file: File; employee: string };
  try {
    validated = validateIncomingForm(incomingForm);
  } catch (e) {
    const error = onError(e);
    return Response.json({ ok: false, ...error }, { status: 400 });
  }

  if (!process.env.THIRDWEB_SECRET_KEY) {
    return Response.json(
      { ok: false, error: "Missing THIRDWEB_SECRET_KEY" },
      { status: 500 }
    );
  }

  const url = `${API_BASE_URL}/api/auditor`;
  let body: unknown = {};
  if (validated.file instanceof Blob) {
    const buf = Buffer.from(await (validated.file as Blob).arrayBuffer());
    const mime = (validated.file as File).type || "application/octet-stream";
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
    body = { imageData: dataUrl };
  }
  /*
  `https://api.thirdweb.com/v1/payments/x402/fetch?from=${serverCompanyWalletAddress}&url=${encodeURIComponent(
      url
    )}&method=POST&maxValue=500000&asset=${
      paymentToken.address
    }&chainId=eip155:${paymentChain.id}`
  */

  let response: Response;
  try {
    response = await fetch(
      `https://api.thirdweb.com/v1/payments/x402/fetch?from=${serverCompanyWalletAddress}&url=${encodeURIComponent(
        url
      )}&method=POST&maxValue=500000&asset=${
        paymentToken.address
      }&chainId=eip155:${paymentChain.id}`,
      {
        method: "POST",
        headers: {
          "x-secret-key": process.env.THIRDWEB_SECRET_KEY!,
        },
        body: JSON.stringify(body),
      }
    );
  } catch (e) {
    const error = onError(e);
    return Response.json({ ok: false, ...error }, { status: 502 });
  }

  const data = await response.json();
  const reimbursementValid = Boolean((data as any)?.reimbursementValid);
  const totalAmount = Number((data as any)?.total || 0);

  let reimburseData: any = { ok: false, error: "" };

  if (data && response.status === 200) {
    if (!reimbursementValid) {
      reimburseData = { ok: false, error: "Reimbursement not valid" };
    } else if (totalAmount === 0) {
      reimburseData = { ok: false, error: "Total amount is 0 or invalid"};
    } else {
      const urlReimburse = `${API_BASE_URL}/api/treasure`;
      try {
        const reimburseResponse = await fetch(urlReimburse, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-secret-key": process.env.THIRDWEB_SECRET_KEY!,
          },
          body: JSON.stringify({ employee: validated.employee, amount: totalAmount }),
        });
        reimburseData = await reimburseResponse.json();
      } catch (e) {
        const error = onError(e);
        return Response.json({ ok: false, reimbursementValid, ...error }, { status: 502 });
      }
    }
  }

  try {
    const record = appendReceiptHistory(
      validated.file,
      validated.employee,
      data,
      reimburseData
    );
    onSuccess(record);
  } catch (e) {
    const error = onError(e);
    return Response.json(
      { ok: false, reimbursementValid, reimburseData, ...error },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, data, reimburseData }, { status: 201 });
}
