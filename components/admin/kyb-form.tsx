"use client";

import { useEffect, useState } from "react";

type KYBStatus = "unsubmitted" | "pending" | "approved" | "rejected";

type KYBData = {
  companyName?: string;
  registrationNumber?: string;
  country?: string;
  contactEmail?: string;
  bankAccountLast4?: string;
};

export default function KYBForm() {
  const [status, setStatus] = useState<KYBStatus>("unsubmitted");
  const [data, setData] = useState<KYBData>({});
  const [saving, setSaving] = useState(false);
  const load = async () => {
    const res = await fetch("/api/kyb");
    if (!res.ok) return;
    const json = await res.json();
    setStatus(json.status);
    setData(json.data ?? {});
  };
  useEffect(() => {
    load();
  }, []);
  const submit = async () => {
    setSaving(true);
    await fetch("/api/kyb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    setSaving(false);
    load();
  };
  return (
    <div className="p-6 rounded-2xl dark:bg-zinc-900 bg-white border dark:border-zinc-800">
      <div className="text-lg font-semibold">KYB</div>
      <div className="mt-1 text-xs dark:text-zinc-400 text-zinc-600">
        Status: {status}
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="Company Name"
          className="w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
          value={data.companyName ?? ""}
          onChange={(e) => setData({ ...data, companyName: e.target.value })}
        />
        <input
          placeholder="Registration Number"
          className="w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
          value={data.registrationNumber ?? ""}
          onChange={(e) =>
            setData({ ...data, registrationNumber: e.target.value })
          }
        />
        <input
          placeholder="Country"
          className="w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
          value={data.country ?? ""}
          onChange={(e) => setData({ ...data, country: e.target.value })}
        />
        <input
          placeholder="Contact Email"
          className="w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
          value={data.contactEmail ?? ""}
          onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
        />
        <input
          placeholder="Bank Account Last 4"
          className="w-full px-3 py-2 rounded-md dark:bg-zinc-800 bg-zinc-100"
          value={data.bankAccountLast4 ?? ""}
          onChange={(e) =>
            setData({ ...data, bankAccountLast4: e.target.value })
          }
        />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          className="text-sm px-4 py-2 rounded-md dark:bg-indigo-600 bg-indigo-600 text-white"
          onClick={submit}
          disabled={saving}
        >
          {saving ? "Submitting" : "Submit"}
        </button>
      </div>
    </div>
  );
}
