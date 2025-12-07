"use client";

import { useMemo, useState } from "react";

type Category = "food" | "travel" | "office" | "other";

export default function EmployeeEstimator() {
  const [amountUsd, setAmountUsd] = useState<number>(50);
  const [category, setCategory] = useState<Category>("food");
  const [vendor, setVendor] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().slice(0, 10));

  const policy = useMemo(
    () => ({
      amountCapUsd: 200,
      allowedCategories: ["food", "travel", "office"],
      vendorWhitelist: ["Uber", "Starbucks", "Staples", "Lyft", "Delta"],
      maxDaysOld: 30,
    }),
    []
  );

  const result = useMemo(() => {
    const selectedDate = new Date(dateStr);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24));
    const categoryOk = policy.allowedCategories.includes(category);
    const vendorOk = policy.vendorWhitelist
      .map((v) => v.toLowerCase())
      .includes(vendor.trim().toLowerCase());
    const dateOk = daysDiff <= policy.maxDaysOld;
    const eligibleAmount = Math.max(0, Math.min(amountUsd, policy.amountCapUsd));
    const eligible = categoryOk && vendorOk && dateOk && eligibleAmount > 0;
    const partial = !eligible && eligibleAmount > 0 && categoryOk && dateOk;
    return {
      eligible,
      partial,
      eligibleAmount,
      daysDiff,
      categoryOk,
      vendorOk,
      dateOk,
    };
  }, [amountUsd, category, vendor, dateStr, policy]);

  return (
    <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white">
      <div className="text-lg font-semibold">Reimbursement Estimator</div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs dark:text-zinc-400 text-zinc-600">Amount (USD)</label>
          <input
            type="number"
            min={0}
            value={amountUsd}
            onChange={(e) => setAmountUsd(Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
          />
        </div>
        <div>
          <label className="text-xs dark:text-zinc-400 text-zinc-600">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
          >
            <option value="food">Food</option>
            <option value="travel">Travel</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-xs dark:text-zinc-400 text-zinc-600">Vendor</label>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
            placeholder="e.g., Uber"
          />
        </div>
        <div>
          <label className="text-xs dark:text-zinc-400 text-zinc-600">Receipt Date</label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
          />
        </div>
      </div>

      <div className="mt-6">
        {result.eligible && (
          <div className="p-4 rounded-xl bg-emerald-600 text-white">
            <div className="text-sm">Estimated Reimbursement</div>
            <div className="text-2xl font-bold mt-1">${result.eligibleAmount.toFixed(2)}</div>
          </div>
        )}
        {!result.eligible && result.partial && (
          <div className="p-4 rounded-xl bg-amber-500 text-white">
            <div className="text-sm">Partial Eligibility</div>
            <div className="text-2xl font-bold mt-1">${result.eligibleAmount.toFixed(2)}</div>
          </div>
        )}
        {!result.eligible && !result.partial && (
          <div className="p-4 rounded-xl bg-red-600 text-white">
            <div className="text-sm">Not Eligible</div>
            <div className="text-xs mt-1">Check category, vendor, date, or amount cap</div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        <div className={`px-3 py-2 rounded-md ${result.categoryOk ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200" : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"}`}>Category</div>
        <div className={`px-3 py-2 rounded-md ${result.vendorOk ? "bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-200" : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"}`}>Vendor</div>
        <div className={`px-3 py-2 rounded-md ${result.dateOk ? "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-200" : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"}`}>Within {policy.maxDaysOld} days</div>
      </div>
    </div>
  );
}

