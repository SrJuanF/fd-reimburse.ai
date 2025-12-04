import { NextRequest } from "next/server";
import { serverCompanyWalletAddress } from "@/lib/thirdweb.server";
import { paymentToken, paymentChain, API_BASE_URL } from "@/lib/constants";
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
  const url = `${API_BASE_URL}/api/auditor`;
  const incomingForm = await request.formData();
  const incomingFile = incomingForm.get("file");
  const outForm = new FormData();
  if (incomingFile instanceof Blob) {
    const filename = incomingFile instanceof File ? incomingFile.name : "file";
    outForm.append("file", incomingFile, filename);
  }

  const response = await fetch(
    `https://api.thirdweb.com/v1/payments/x402/fetch?from=${serverCompanyWalletAddress}&url=${encodeURIComponent(
      url
    )}&method=GET&maxValue=500000&asset=${
      paymentToken.address
    }&chainId=eip155:${paymentChain.id}`,
    {
      method: "POST",
      headers: {
        "x-secret-key": process.env.THIRDWEB_SECRET_KEY!,
      },
      body: outForm,
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

  return Response.json({ ok: response.ok, status: response.status, data });
}
