"use client";

import { useEffect, useState } from "react";
import ReceiptsUploader from "./receipts-uploader";
import Image from "next/image";

type Receipt = {
  name: string;
  url: string;
  size: number;
  updatedAt?: number;
};

export default function EmployeeDashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/treasure/receipts");
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { receipts: Receipt[] };
      setReceipts(data.receipts ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl px-4 mt-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Receipts</h2>
        <button
          className="text-sm px-3 py-1.5 rounded-md dark:bg-zinc-800 bg-zinc-200"
          onClick={loadReceipts}
          disabled={loading}
        >
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      <div className="flex w-full justify-center">
        <ReceiptsUploader onUploaded={loadReceipts} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-sm dark:text-zinc-400 text-zinc-600">
          {receipts.length} receipt{receipts.length === 1 ? "" : "s"}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((r) => (
            <div
              key={r.url}
              className="p-3 rounded-xl dark:bg-zinc-800 bg-zinc-100"
            >
              <div className="w-full">
                <Image
                  src={r.url}
                  alt={r.name}
                  width={600}
                  height={400}
                  className="w-full h-auto max-h-64 object-contain rounded-md"
                />
              </div>
              <div className="mt-2 text-xs flex items-center justify-between">
                <span className="truncate" title={r.name}>
                  {r.name}
                </span>
                <span className="dark:text-zinc-400 text-zinc-500">
                  {(r.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
