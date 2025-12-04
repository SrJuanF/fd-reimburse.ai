import { NextRequest } from "next/server";
//import { wrapFetchWithPayment } from "thirdweb/x402";
import {
  serverCompanyWalletAddress,
} from "@/lib/thirdweb.server";
import { paymentToken, paymentChain, API_BASE_URL } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ ok: true });
}

export async function POST(request: NextRequest) {
  /*const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);
  const response = await fetchWithPay("/api/auditor");
  const data = await response.json();
  console.log(data);*/

  const url = `${API_BASE_URL}/api/auditor`;

  const response = await fetch(
    `https://api.thirdweb.com/v1/payments/x402/fetch?from=${serverCompanyWalletAddress}&url=${encodeURIComponent(
      url
    )}&method=GET&maxValue=500000&asset=${paymentToken.address}&chainId=eip155:${
      paymentChain.id
    }`,
    {
      method: "POST",
      headers: {
        "Content-Type": "*/*",
        "x-secret-key": process.env.THIRDWEB_SECRET_KEY!,
      },
      body: '{"key":"value"}',
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
