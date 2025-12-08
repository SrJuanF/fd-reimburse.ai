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

export async function GET() {
  return Response.json({ receipts: RECEIPT_HISTORY });
}

export async function POST(request: NextRequest) {
  const incomingForm = await request.formData();
  const incomingFile = incomingForm.get("file");
  const incomingAddress = incomingForm.get("employee");

  const url = `${API_BASE_URL}/api/auditor`;
  let body: unknown = {};
  if (incomingFile instanceof Blob) {
    const buf = Buffer.from(await (incomingFile as Blob).arrayBuffer());
    const mime = (incomingFile as File).type || "application/octet-stream";
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

  const response = await fetch(
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

  const data = await response.json();

  //let data = await auditorResponse.json();

  let reimburseData: any = false;

  if (data && response.status === 200) {
    const urlReimburse = `${API_BASE_URL}/api/treasure`;

    const reimburseResponse = await fetch(urlReimburse, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": process.env.THIRDWEB_SECRET_KEY!,
      },
      body: JSON.stringify({
        employee:
          typeof incomingAddress === "string" ? incomingAddress : undefined,
      }),
    });
    reimburseData = await reimburseResponse.json();
    console.log(reimburseData);
  }

  try {
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
    const ok = Boolean(reimburseData?.ok);
    const transactionHash =
      typeof reimburseData?.transactionHash === "string"
        ? reimburseData.transactionHash
        : undefined;

    RECEIPT_HISTORY.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      employee:
        typeof incomingAddress === "string" ? incomingAddress : undefined,
      fileName,
      size,
      reimbursementValid,
      decisionReason,
      ok,
      transactionHash,
      timestamp: Date.now(),
    });
  } catch {}

  return Response.json({ ok: true, data, reimburseData });
}
