import { myProvider } from "@/lib/models";
import { generateText } from "ai";
import { NextRequest } from "next/server";
import {
  settlePayment,
  facilitator,
  verifyPayment,
  PaymentArgs,
} from "thirdweb/x402";
import { avalancheFuji } from "thirdweb/chains";
import { serverClient, serverAgentAWalletAddress } from "@/lib/thirdweb.server";
import {
  MAX_INFERENCE_TOKENS_PER_CALL,
  paymentToken,
  PRICE_PER_INFERENCE_TOKEN_WEI,
  API_BASE_URL,
} from "@/lib/constants";
import { type SettlePaymentResult } from "thirdweb/x402";

const twFacilitator = facilitator({
  client: serverClient,
  serverWalletAddress: serverAgentAWalletAddress,
});

const asset = {
  address: paymentToken.address as `0x${string}`,
};

export async function POST(request: NextRequest) {

  // PRE-PAYMENT
  const paymentData = request.headers.get("x-payment");
  const paymentArgs: PaymentArgs = {
    resourceUrl: `${API_BASE_URL}/api/auditor`,
    method: "POST",
    paymentData,
    network: avalancheFuji,
    scheme: "upto",
    payTo: process.env.THIRDWEB_AGENTA_MERCHANT_WALLET_ADDRESS!,
    price: {
      amount: (PRICE_PER_INFERENCE_TOKEN_WEI * MAX_INFERENCE_TOKENS_PER_CALL).toString(),
      asset,
    },
    facilitator: twFacilitator,
  };

  // verify the signed payment data with maximum payment amount before doing any work
  const verification = await verifyPayment(paymentArgs);

  if (verification.status !== 200) {
    return Response.json(verification.responseBody, {
      status: verification.status,
      headers: verification.responseHeaders,
    });
  }

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
      const { imageUrl, imageData } = body as {
        imageUrl?: string;
        imageData?: string;
      };
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
      {
        error: "image_required",
        errorMessage:
          "Provide an image via multipart 'file' or JSON 'imageUrl'/'imageData'.",
      },
      { status: 400 }
    );
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
    contentParts.push({
      type: "file",
      data: new Uint8Array(buffer),
      mediaType: imagePart.type,
    });
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
  const blob =
    fence?.[1] ??
    (() => {
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

  //PAYMENT
  let settle: SettlePaymentResult | null | undefined = null;
  if (!totalTokens) {
    console.error("Token usage data not available");
  } else {
    const finalPrice = PRICE_PER_INFERENCE_TOKEN_WEI * totalTokens;
    console.log("TotalTokens:", totalTokens, "FinalPrice:", finalPrice);
    try {
      settle = await settlePayment({
        ...paymentArgs,
        price: {
          amount: finalPrice.toString(),
          asset,
        },
        waitUntil: "confirmed",
      });

      console.log(`Payment result: ${settle?.status}`);
    } catch (error) {
      console.error("Payment settlement failed:", error);
    }
  }

  if (json && settle?.status === 200) {
    return Response.json(json, { status: 200 });
  }
  return Response.json(
    { message: "Payment settlement failed", settle },
    { status: 400 }
  );
}
