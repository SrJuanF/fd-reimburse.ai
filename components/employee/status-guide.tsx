"use client";

export default function StatusGuide() {
  return (
    <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white">
      <div className="text-lg font-semibold">Receipt Status</div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
          <div className="text-sm font-medium">Submitted</div>
          <div className="text-xs dark:text-zinc-400 text-zinc-600 mt-1">Uploaded and queued</div>
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded-md bg-emerald-600 text-white">Trust</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800">
          <div className="text-sm font-medium">Audited</div>
          <div className="text-xs dark:text-zinc-400 text-zinc-600 mt-1">Policies applied and validated</div>
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded-md bg-cyan-600 text-white">Integrity</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800">
          <div className="text-sm font-medium">Paid</div>
          <div className="text-xs dark:text-zinc-400 text-zinc-600 mt-1">USDC sent to your wallet</div>
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded-md bg-violet-600 text-white">Speed</span>
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
        <div className="text-sm font-medium">Advance (Optional)</div>
        <div className="text-xs dark:text-zinc-400 text-zinc-600 mt-1">Liquidity advance available when enabled by your company</div>
        <div className="mt-2 inline-flex items-center gap-2">
          <span className="px-2 py-1 text-xs rounded-md bg-amber-500 text-white">Liquidity</span>
        </div>
      </div>
    </div>
  );
}

