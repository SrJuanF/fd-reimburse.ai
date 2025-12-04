import { settlePayment, facilitator } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";
import { avalancheFuji } from "thirdweb/chains";
import { paymentToken, API_BASE_URL } from "@/lib/constants";
import {serverAgentAWalletAddress} from "@/lib/thirdweb.server";

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

const thirdwebFacilitator = facilitator({
  client,
  serverWalletAddress: serverAgentAWalletAddress,
});


export async function GET(request: Request) {
  const paymentData = request.headers.get("x-payment");

  const result = await settlePayment({
    resourceUrl: `${API_BASE_URL}/api/auditor`,
    method: "GET",
    paymentData,
    payTo: process.env.THIRDWEB_AGENTA_MERCHANT_WALLET_ADDRESS!,
    network: avalancheFuji,
    price: {
      amount: "10000", // $0.01 USDC
      asset: {
        address: paymentToken.address as `0x${string}`,
      },
    },
    facilitator: thirdwebFacilitator,
  });

  if (result.status === 200) {
    return Response.json({
      tier: "basic",
      data: "Welcome to Basic tier! You now have access to standard features.",
      timestamp: new Date().toISOString(),
    });
  } else {
    return Response.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  }
}