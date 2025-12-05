"use client";
import ReceiptsUploader from "@/components/receipts-uploader";
import { SignInButton } from "@/components/sign-in-button";
import { useActiveAccount } from "thirdweb/react";
import { ALLOWED_WALLETS } from "@/lib/whitelist";

export default function Home() {
  const activeAccount = useActiveAccount();
  const addr = activeAccount?.address?.toLowerCase();

  if (!addr) {
    return (
      <div className="flex flex-col size-full items-center mt-12">
        <div className="mb-6 text-lg font-semibold">Sign in to continue</div>
        <SignInButton />
      </div>
    );
  }

  const isAllowed = ALLOWED_WALLETS.includes(addr);

  if (!isAllowed) {
    return (
      <div className="flex flex-col size-full items-center mt-12">
        <div className="max-w-xl w-full p-6 rounded-2xl dark:bg-zinc-900 bg-white border dark:border-zinc-800 text-center">
          <div className="text-xl font-bold mb-2">Access Denied</div>
          <div className="text-sm dark:text-zinc-400 text-zinc-600">Authorized Affiliates Only. Please connect a company wallet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col size-full items-center">
      <ReceiptsUploader />
    </div>
  );
}
