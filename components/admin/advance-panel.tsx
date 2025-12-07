"use client";

import { useEffect, useState } from "react";

type Config = {
  creditLimitUsd: number;
  utilizationUsd: number;
  feeBps: number;
  enabled: boolean;
};

export default function AdvancePanel() {
  const [config, setConfig] = useState<Config | null>(null);
  const [amountUsd, setAmountUsd] = useState<number>(0);
  const [decision, setDecision] = useState<{
    approved: boolean;
    feeUsd?: number;
    reason?: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    const res = await fetch("/api/advance/config");
    if (!res.ok) return;
    const data = await res.json();
    setConfig(data.config ?? null);
  };
  useEffect(() => {
    load();
  }, []);
  const save = async () => {
    if (!config) return;
    setSaving(true);
    await fetch("/api/advance/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });
    setSaving(false);
  };
  const decide = async () => {
    const res = await fetch("/api/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountUsd }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setDecision(data.decision ?? null);
  };
  return (
    <div className="p-6 rounded-2xl dark:bg-zinc-900 bg-white border dark:border-zinc-800">
      <div className="text-lg font-semibold">Receipts Advance</div>
      {!config ? (
        <div className="mt-3 text-sm dark:text-zinc-400 text-zinc-600">
          Loading
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs dark:text-zinc-400 text-zinc-600">
              Credit Limit (USD)
            </label>
            <input
              type="number"
              value={config.creditLimitUsd}
              onChange={(e) =>
                setConfig({ ...config, creditLimitUsd: Number(e.target.value) })
              }
              className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
            />
          </div>
          <div>
            <label className="text-xs dark:text-zinc-400 text-zinc-600">
              Utilization (USD)
            </label>
            <input
              type="number"
              value={config.utilizationUsd}
              onChange={(e) =>
                setConfig({ ...config, utilizationUsd: Number(e.target.value) })
              }
              className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
            />
          </div>
          <div>
            <label className="text-xs dark:text-zinc-400 text-zinc-600">
              Fee (bps)
            </label>
            <input
              type="number"
              value={config.feeBps}
              onChange={(e) =>
                setConfig({ ...config, feeBps: Number(e.target.value) })
              }
              className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
            />
          </div>
          <div>
            <label className="text-xs dark:text-zinc-400 text-zinc-600">
              Enabled
            </label>
            <select
              value={config.enabled ? "yes" : "no"}
              onChange={(e) =>
                setConfig({ ...config, enabled: e.target.value === "yes" })
              }
              className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              className="text-sm px-4 py-2 rounded-md dark:bg-indigo-600 bg-indigo-600 text-white"
              onClick={save}
              disabled={saving}
            >
              {saving ? "Saving" : "Save"}
            </button>
          </div>
        </div>
      )}
      <div className="mt-6">
        <div className="text-sm font-semibold">Simulate Decision</div>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            placeholder="Amount USD"
            value={amountUsd}
            onChange={(e) => setAmountUsd(Number(e.target.value))}
            className="w-48 px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
          />
          <button
            className="text-sm px-4 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
            onClick={decide}
          >
            Decide
          </button>
        </div>
        {decision && (
          <div className="mt-3 text-sm dark:text-zinc-300 text-zinc-700">
            {decision.approved
              ? `Approved • Fee $${(decision.feeUsd ?? 0).toFixed(2)}`
              : `Declined • ${decision.reason}`}
          </div>
        )}
      </div>
    </div>
  );
}
