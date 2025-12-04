import { NextRequest } from "next/server";
import { wrapFetchWithPayment } from "thirdweb/x402";
import {serverClient as client, serverAgentAWalletAddress} from "@/lib/thirdweb.server";


export const runtime = "nodejs";


export async function GET() {
  return Response.json({ ok: true });
}

export async function POST(request: NextRequest) {
  

  /*const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);
  const response = await fetchWithPay("/api/auditor");
  const data = await response.json();
  console.log(data);*/


  return Response.json({ ok: true});
}
