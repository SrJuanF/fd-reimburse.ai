"use client";

import { useEffect, useState } from "react";

type Policy = {
  amountCapUsd: number;
  allowedCategories: string[];
  vendorWhitelist: string[];
  maxDaysOld: number;
};

export default function PolicyForm() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    const res = await fetch("/api/policies");
    if (!res.ok) return;
    const data = await res.json();
    setPolicy(data.policy ?? null);
  };
  useEffect(() => {
    load();
  }, []);
  const save = async () => {
    if (!policy) return;
    setSaving(true);
    await fetch("/api/policies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(policy),
    });
    setSaving(false);
  };
  return (
    <div className="p-6 rounded-2xl dark:bg-zinc-900 bg-white border dark:border-zinc-800">
      <div className="text-lg font-semibold">Policy Controls</div>
      {!policy ? (
        <div className="mt-3 text-sm dark:text-zinc-400 text-zinc-600">
          Loading
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs dark:text-zinc-400 text-zinc-600">
              Amount Cap (USD)
            </label>
            <input
              type="number"
              value={policy.amountCapUsd}
              onChange={(e) =>
                setPolicy({ ...policy, amountCapUsd: Number(e.target.value) })
              }
              className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
            />
          </div>
          <div>
            <label className="text-xs dark:text-zinc-400 text-zinc-600">
              Max Days Old
            </label>
            <input
              type="number"
              value={policy.maxDaysOld}
              onChange={(e) =>
                setPolicy({ ...policy, maxDaysOld: Number(e.target.value) })
              }
              className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs dark:text-zinc-400 text-zinc-600">
              Allowed Categories (comma)
            </label>
            <input
              type="text"
              value={policy.allowedCategories.join(",")}
              onChange={(e) =>
                setPolicy({
                  ...policy,
                  allowedCategories: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs dark:text-zinc-400 text-zinc-600">
              Vendor Whitelist (comma)
            </label>
            <input
              type="text"
              value={policy.vendorWhitelist.join(",")}
              onChange={(e) =>
                setPolicy({
                  ...policy,
                  vendorWhitelist: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
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
    </div>
  );
}
