import { NextRequest } from "next/server";
import { serverCompanyWalletAddress } from "@/lib/thirdweb.server";
import { paymentToken, paymentChain, API_BASE_URL, AUDIT_FIXED_PRICE_WEI } from "@/lib/constants";
//import { wrapFetchWithPayment } from "thirdweb/x402";
/*const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);
  const response = await fetchWithPay("/api/auditor");
  const data = await response.json();
  console.log(data);*/

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const incomingForm = await request.formData();
  const incomingFile = incomingForm.get("file");
  const incomingAddress = incomingForm.get("employee");

  const baseUrl = (API_BASE_URL || "").replace(/[:/]+$/, "");
  const url = `${baseUrl}/api/auditor`;
  let body: unknown = {};
  if (incomingFile instanceof Blob) {
    const buf = Buffer.from(await (incomingFile as Blob).arrayBuffer());
    const mime = (incomingFile as File).type || "application/octet-stream";
    const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;
    body = { imageData: dataUrl };
  }

  const response = await fetch(
    `https://api.thirdweb.com/v1/payments/x402/fetch?from=${serverCompanyWalletAddress}&url=${encodeURIComponent(
      url
    )}&method=POST&maxValue=${AUDIT_FIXED_PRICE_WEI}&asset=${
      paymentToken.address
    }&chainId=eip155:${paymentChain.id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": process.env.THIRDWEB_SECRET_KEY!,
      },
      body: JSON.stringify(body),
    }
  );

  const contentType = response.headers.get("content-type") || "";
  let data: unknown;
  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { text };
    }
  } catch (err) {
    const text = await response.text().catch(() => "");
    data = { parseError: String(err), text, status: response.status };
  }

  console.log(data);

  if (response.status !== 200) {
    return Response.json({ ok: false, data }, { status: response.status });
  }

  let reimburseData = false;

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

  if (response.status !== 200) {
    return Response.json({ ok: false, data }, { status: response.status });
  }

  return Response.json({ ok: true, data, reimburseData });
}
