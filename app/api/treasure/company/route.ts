//Manage Company server wallets
// server-wallet.ts
/*import {
  createThirdwebClient,
  Engine,
  getContract,
  transfer,
  NATIVE_TOKEN_ADDRESS,
} from "thirdweb";
import { defineChain } from "thirdweb/chains";

const AGENT_A_URL = "http://localhost:3000/protected-resource";
const SECRET_KEY = "YOUR_THIRDWEB_SECRET_KEY";
const SERVER_WALLET_ADDRESS = "YOUR_SERVER_WALLET_ADDRESS";
const VAULT_ACCESS_TOKEN = "YOUR_VAULT_ACCESS_TOKEN"; // If using Engine Cloud

async function main() {
  // 1. Call Agent A
  let res = await fetch(AGENT_A_URL);
  if (res.status !== 402) {
    const data = await res.json();
    console.log("Resource:", data);
    return;
  }
  const paymentInfo = await res.json();
  // paymentInfo: { address, amount, chainId, tokenAddress? }

  // 2. Send payment
  const client = createThirdwebClient({ secretKey: SECRET_KEY });
  const serverWallet = Engine.serverWallet({
    client,
    address: SERVER_WALLET_ADDRESS,
    vaultAccessToken: VAULT_ACCESS_TOKEN,
  });

  const contract = await getContract({
    client,
    address: paymentInfo.tokenAddress || NATIVE_TOKEN_ADDRESS,
    chain: defineChain(paymentInfo.chainId),
  });

  const transaction = transfer({
    contract,
    to: paymentInfo.address,
    amount: BigInt(paymentInfo.amount), // amount in wei
  });

  const { transactionId } = await serverWallet.enqueueTransaction({
    transaction,
  });
  await Engine.waitForTransactionHash({ client, transactionId });

  // 3. Retry Agent A
  res = await fetch(AGENT_A_URL);
  const data = await res.json();
  console.log("Resource after payment:", data);
}

main().catch(console.error);
*/

/*
// agent-a.ts
import express from "express";

const app = express();
app.use(express.json());

let paymentReceived = false;

app.get("/protected-resource", (req, res) => {
  if (!paymentReceived) {
    // Return 402 with payment details
    return res.status(402).json({
      address: "0xRecipientAddress",
      amount: "10000000000000000", // 0.01 ETH in wei
      chainId: 1,
      tokenAddress: undefined, // or specify ERC20 address
    });
  }
  // After payment, return the resource
  res.json({ message: "Here is your paid resource!" });
});

// For demo: endpoint to simulate payment received
app.post("/simulate-payment", (req, res) => {
  paymentReceived = true;
  res.json({ ok: true });
});

app.listen(3000, () => console.log("Agent A running on :3000"));

*/