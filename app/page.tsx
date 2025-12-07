"use client";
import DashboardSwitcher from "@/components/dashboard-switcher";
import { SignInButton } from "@/components/sign-in-button";
import { useActiveAccount } from "thirdweb/react";
import { ALLOWED_WALLETS } from "@/lib/whitelist";

export default function Home() {
  const activeAccount = useActiveAccount();
  const addr = activeAccount?.address?.toLowerCase();

  if (!addr) {
    return (
      <div className="min-h-dvh w-full bg-gradient-to-b from-emerald-50 via-cyan-50 to-violet-50 dark:from-emerald-950 dark:via-cyan-950 dark:to-violet-950 flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl w-full text-center">
          <div className="text-3xl font-bold tracking-tight">
            Receipts to Reimbursements
          </div>
          <div className="mt-2 text-sm dark:text-zinc-400 text-zinc-600">
            Trusted audits, fast payouts, optional liquidity advance
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 text-xs rounded-full bg-emerald-600 text-white">
              Trust
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-cyan-600 text-white">
              Integrity
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-violet-600 text-white">
              Speed
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-amber-500 text-white">
              Liquidity
            </span>
          </div>
          <div className="mt-8 flex items-center justify-center">
            <SignInButton />
          </div>
        </div>
      </div>
    );
  }

  const isAllowed = ALLOWED_WALLETS.includes(addr);

  if (!isAllowed) {
    return (
      <div className="min-h-dvh w-full bg-gradient-to-b from-amber-50 to-emerald-50 dark:from-amber-950 dark:to-emerald-950 flex items-center justify-center px-4">
        <div className="max-w-xl w-full p-6 rounded-2xl dark:bg-zinc-900 bg-white border-2 border-amber-400 text-center">
          <div className="text-xl font-bold mb-2">Access Denied</div>
          <div className="text-sm dark:text-zinc-400 text-zinc-600">
            Authorized affiliates only. Connect a company wallet to continue.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col size-full items-center">
      <DashboardSwitcher addr={addr} />
    </div>
  );
}
