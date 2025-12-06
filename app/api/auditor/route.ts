import { myProvider } from "@/lib/models";
import { generateText } from "ai";
import { NextRequest } from "next/server";
import { settlePayment, facilitator, verifyPayment } from "thirdweb/x402";
import { getContract } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";
import { avalancheFuji } from "thirdweb/chains";
import {
  serverClient,
  serverAgentAWalletAddress,
} from "@/lib/thirdweb.server";
import { paymentToken, API_BASE_URL, paymentChain, AUDIT_FIXED_PRICE_WEI } from "@/lib/constants";
import { serverCompanyWalletAddress } from "@/lib/thirdweb.server";

const twFacilitator = facilitator({
  client: serverClient,
  serverWalletAddress: serverAgentAWalletAddress,
});

const asset = {
  address: paymentToken.address as `0x${string}`,
};

export async function POST(request: NextRequest) {
  //IMAGE PRE-PROCESSING
  // Enforce image input: accept multipart/form-data (field: "file") or JSON (fields: "imageUrl" | "imageData")
  let imagePart: Blob | URL | string | undefined;
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (file && file.size > 0) {
      imagePart = file;
    }
  } else {
    try {
      const body = await request.json().catch(() => ({}));
      const { imageUrl, imageData } = body as { imageUrl?: string; imageData?: string };
      if (imageUrl) {
        imagePart = new URL(imageUrl);
      } else if (imageData) {
        imagePart = imageData; // expected data URL string: e.g. "data:image/png;base64,..."
      }
    } catch {
      // ignore parse errors; handled below
    }
  }

  if (!imagePart) {
    return Response.json(
      { error: "image_required", errorMessage: "Provide an image via multipart 'file' or JSON 'imageUrl'/'imageData'." },
      { status: 400 }
    );
  }

  const paymentData = request.headers.get("x-payment");
  const baseUrl = (API_BASE_URL || "").replace(/[:/]+$/, "");
  const paymentArgs = {
    resourceUrl: `${baseUrl}/api/auditor`,
    method: "POST",
    paymentData,
    network: avalancheFuji,
    payTo: process.env.THIRDWEB_AGENTA_MERCHANT_WALLET_ADDRESS!,
    price: {
      amount: AUDIT_FIXED_PRICE_WEI.toString(),
      asset,
    },
    facilitator: twFacilitator,
  };

  if (!paymentData) {
    return Response.json({ message: "payment_required" }, { status: 402 });
  }

  const verification = await verifyPayment(paymentArgs);

  if (verification.status !== 200) {
    return Response.json(verification.responseBody, {
      status: verification.status,
      headers: verification.responseHeaders,
    });
  }

  const usdcContract = getContract({
    client: serverClient,
    address: paymentToken.address,
    chain: paymentChain,
  });
  const companyBalance = await balanceOf({ contract: usdcContract, address: serverCompanyWalletAddress });
  const minRequired = AUDIT_FIXED_PRICE_WEI;
  if (companyBalance < minRequired) {
    return Response.json({ message: "payment_required" }, { status: 402 });
  }
  // Build content parts compatible with AI SDK 5
  const contentParts: Array<
    | { type: "text"; text: string }
    | { type: "image"; image: URL | string }
    | { type: "file"; data: Uint8Array; mediaType: string }
  > = [{ type: "text", text: "Audit this receipt and report findings." }];

  if (imagePart instanceof URL || typeof imagePart === "string") {
    contentParts.push({ type: "image", image: imagePart });
  } else if (imagePart instanceof Blob) {
    const buffer = await imagePart.arrayBuffer();
    contentParts.push({ type: "file", data: new Uint8Array(buffer), mediaType: imagePart.type });
  }

  //AGENT IMAGE-PROCESSING
  const receiptAuditSystemPrompt =
    "You are a Receipt Vision Auditor. Analyze the provided receipt image and extract: merchant name, purchase date, currency, subtotal, taxes, fees, tip, total, payment method, and line items (description, quantity, unit price, line total). Validate totals (e.g., subtotal + taxes + fees + tip = total), identify anomalies (illegible fields, inconsistent tax rates, duplicated items, altered amounts, missing merchant/date), and provide a concise audit summary followed by a JSON block with keys: merchant, date, currency, subtotal, taxes, fees, tip, total, paymentMethod, items[], anomalies[]. If a field is uncertain, include it with null and note the uncertainty in anomalies. Additionally, apply this hackathon reimbursement policy: a receipt is valid if the total is under 100 USD and the purchase date is in the year 2025. In the JSON, include reimbursementValid (boolean) and decisionReason (string) explaining the decision strictly based on this policy.";

  const result = await generateText({
    system: receiptAuditSystemPrompt,
    model: myProvider.languageModel("gpt-4o"),
    messages: [
      {
        role: "user",
        content: contentParts,
      },
    ],
  });

  const raw = result.text ?? "";
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const blob = fence?.[1] ?? (() => {
    const s = raw.indexOf("{");
    const e = raw.lastIndexOf("}");
    return s !== -1 && e !== -1 && e > s ? raw.slice(s, e + 1) : "";
  })();

  let json: unknown = null;
  try {
    json = blob ? JSON.parse(blob) : null;
  } catch {
    console.error("Failed to parse JSON from model output");
  }
  const totalTokens = result.usage?.totalTokens;

  let settle;
  {
    const finalPrice = AUDIT_FIXED_PRICE_WEI;
    console.log("TotalTokens:", totalTokens, "FinalPrice:", finalPrice);
    settle = await settlePayment({
      ...paymentArgs,
      scheme: "exact",
      price: {
        amount: finalPrice.toString(),
        asset,
      },
      waitUntil: "confirmed",
    });
    console.log(`Payment result: ${settle.responseHeaders}`);
  }

  if (json && settle?.status === 200) {
    return Response.json(json, { status: 200 });
  }
  return Response.json({ message: "payment_required", raw }, { status: 402 });
}
