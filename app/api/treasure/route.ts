import { NextRequest } from "next/server";
import { getContract, Engine } from "thirdweb";
import { transfer } from "thirdweb/extensions/erc20";
import {
  serverClient,
  serverCompanyAccount,
  serverAgentAWalletAddress,
} from "@/lib/thirdweb.server";
import { paymentChain, paymentToken } from "@/lib/constants";

export async function POST(request: NextRequest) {
  // 1. Obtén el contrato USDC
  const usdcContract = getContract({
    client: serverClient,
    address: paymentToken.address, // tu address de USDC
    chain: paymentChain,
  });

  // 2. Prepara la transacción (0.01 USDC, asumiendo 6 decimales)
  const transaction = transfer({
    contract: usdcContract,
    to: serverAgentAWalletAddress,
    amount: 0.01, // puedes usar string o number, la extensión maneja los decimales
  });

  // 3. Envía la transacción
  const { transactionId } = await serverCompanyAccount.enqueueTransaction({
    transaction,
  });

  // 4 Espera a que la transacción se confirme
  const { transactionHash } = await Engine.waitForTransactionHash({
    client: serverClient,
    transactionId, // the transaction id returned from enqueueTransaction
  });

  // 4.1 Verifica el estado de la transacción
  const executionResult = await Engine.getTransactionStatus({
    client: serverClient,
    transactionId, // the transaction id returned from enqueueTransaction
  });

  return Response.json({
    ok: true,
    transactionHash,
    executionResult,
  });

}

export async function GET() {
  return Response.json({ ok: true });
}
