"use client";

import { useEffect, useState } from "react";

type Entry = {
  id: string;
  employee: string;
  amountUsd: number;
  feeUsd: number;
  type: "advance" | "company";
  status: "pending" | "settled";
  timestamp: number;
};

function formatUsd(v: number) {
  return `$${v.toFixed(2)}`;
}

export default function LedgerTable() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ledger");
      if (!res.ok) return;
      const data = await res.json();
      setEntries(data.entries ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="p-6 rounded-2xl dark:bg-zinc-900 bg-white border dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Ledger</div>
        <button className="text-sm px-3 py-1.5 rounded-md dark:bg-zinc-800 bg-zinc-100" onClick={load} disabled={loading}>
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border dark:border-zinc-800">
        <table className="min-w-full text-sm">
          <thead className="dark:bg-zinc-900 bg-zinc-50">
            <tr>
              <th className="text-left px-4 py-3">Employee</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-right px-4 py-3">Fee</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="dark:bg-zinc-950 bg-white">
            {entries.map((e) => (
              <tr key={e.id} className="border-t dark:border-zinc-800">
                <td className="px-4 py-3 font-mono text-xs">{e.employee.slice(0, 6)}...{e.employee.slice(-4)}</td>
                <td className="px-4 py-3 text-right">{formatUsd(e.amountUsd)}</td>
                <td className="px-4 py-3 text-right">{formatUsd(e.feeUsd)}</td>
                <td className="px-4 py-3">{e.type}</td>
                <td className="px-4 py-3">{e.status}</td>
                <td className="px-4 py-3 text-xs">{new Date(e.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-zinc-500" colSpan={6}>No entries</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
