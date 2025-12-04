"use client";

import { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  wallet: string;
  totalBalanceUsd: number;
};

function formatUsd(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function CompanyBalancesDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/treasure/employees");
      if (!res.ok) return;
      const data = (await res.json()) as { employees: Employee[] };
      setEmployees(data.employees ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl px-4 mt-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Company Receipts Balances</h2>
        <button
          className="text-sm px-3 py-1.5 rounded-md dark:bg-zinc-800 bg-zinc-100"
          onClick={load}
          disabled={loading}
        >
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border dark:border-zinc-800">
        <table className="min-w-full text-sm">
          <thead className="dark:bg-zinc-900 bg-zinc-50">
            <tr>
              <th className="text-left px-4 py-3">Employee</th>
              <th className="text-left px-4 py-3">Wallet</th>
              <th className="text-right px-4 py-3">Total Balance</th>
            </tr>
          </thead>
          <tbody className="dark:bg-zinc-950 bg-white">
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t dark:border-zinc-800">
                <td className="px-4 py-3">{emp.name}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {emp.wallet.slice(0, 6)}...{emp.wallet.slice(-4)}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatUsd(emp.totalBalanceUsd)}
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-zinc-500" colSpan={3}>
                  No employees
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
