import { Engine, createThirdwebClient } from "thirdweb";
//import {createWalletAdapter} from "thirdweb/adapters";
//import { viemAdapter } from "thirdweb/adapters/viem";
import {paymentChain} from "@/lib/constants";

export const serverCompanyWalletAddress = process.env.THIRDWEB_COMPANY_SERVER_WALLET_ADDRESS!;
export const serverAgentAWalletAddress = process.env.THIRDWEB_AGENTA_SERVER_WALLET_ADDRESS!;

export const serverClient = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

export const serverAccount = Engine.serverWallet({
  client: serverClient,
  address: serverCompanyWalletAddress,
  chain: paymentChain,
});
/*
export const serverWallet = createWalletAdapter({
  client: serverClient,
  adaptedAccount: serverAccount,
  chain: paymentChain,
});*/

/*
const wallets = await Engine.getServerWallets({
  client,
});
*/
