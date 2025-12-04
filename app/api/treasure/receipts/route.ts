import { NextRequest } from "next/server";
import { wrapFetchWithPayment } from "thirdweb/x402";
import {serverClient as client} from "@/lib/thirdweb.server";


export const runtime = "nodejs";

type Receipt = {
  name: string;
  url: string;
  size: number;
  type: string;
  updatedAt: number;
};

const receiptsStore: Receipt[] = [];

export async function GET() {
  return Response.json({ receipts: receiptsStore });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "File must be an image" }, { status: 400 });
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return Response.json({ error: "Maximum size 5MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const url = `data:${file.type};base64,${base64}`;

  const receipt: Receipt = {
    name: file.name,
    size: file.size,
    type: file.type,
    url,
    updatedAt: Date.now(),
  };

  receiptsStore.unshift(receipt);

  /*const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);
  const response = await fetchWithPay("/api/auditor");
  const data = await response.json();
  console.log(data);*/


  return Response.json({ ok: true, receipt });
}
