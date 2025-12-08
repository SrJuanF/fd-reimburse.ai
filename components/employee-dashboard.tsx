"use client";

import { useEffect, useState } from "react";
import ReceiptsUploader from "./receipts-uploader";
import EmployeeEstimator from "./employee/employee-estimator";
import StatusGuide from "./employee/status-guide";
import FAQ from "./employee/faq";

type Receipt = {
  id: string;
  employee?: string;
  fileName?: string;
  size?: number;
  reimbursementValid: boolean;
  decisionReason?: string;
  ok: boolean;
  transactionHash?: string;
  timestamp: number;
};

export default function EmployeeDashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"receipts" | "estimator" | "status" | "faq">(
    "receipts"
  );

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
        <h2 className="text-2xl font-bold">Employee Portal</h2>
        {tab === "receipts" && (
          <button
            className="text-sm px-3 py-1.5 rounded-md bg-emerald-600 text-white"
            onClick={loadReceipts}
            disabled={loading}
          >
            {loading ? "Refreshing" : "Refresh"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className={`text-sm px-3 py-1.5 rounded-md ${
            tab === "receipts"
              ? "bg-emerald-600 text-white"
              : "dark:bg-zinc-800 bg-zinc-200"
          }`}
          onClick={() => setTab("receipts")}
        >
          Receipts
        </button>
        <button
          className={`text-sm px-3 py-1.5 rounded-md ${
            tab === "estimator"
              ? "bg-cyan-600 text-white"
              : "dark:bg-zinc-800 bg-zinc-200"
          }`}
          onClick={() => setTab("estimator")}
        >
          Estimator
        </button>
        <button
          className={`text-sm px-3 py-1.5 rounded-md ${
            tab === "status"
              ? "bg-violet-600 text-white"
              : "dark:bg-zinc-800 bg-zinc-200"
          }`}
          onClick={() => setTab("status")}
        >
          Status
        </button>
        <button
          className={`text-sm px-3 py-1.5 rounded-md ${
            tab === "faq"
              ? "bg-amber-500 text-white"
              : "dark:bg-zinc-800 bg-zinc-200"
          }`}
          onClick={() => setTab("faq")}
        >
          FAQ
        </button>
      </div>

      {tab === "receipts" && (
        <>
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
                  key={r.id}
                  className="p-3 rounded-xl dark:bg-zinc-800 bg-zinc-100"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="text-sm font-medium truncate"
                      title={r.fileName || "Receipt"}
                    >
                      {r.fileName || "Receipt"}
                    </div>
                    {typeof r.size === "number" ? (
                      <div className="text-xs dark:text-zinc-400 text-zinc-500">
                        {(r.size / 1024).toFixed(1)} KB
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-md ${
                        r.reimbursementValid
                          ? "bg-emerald-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {r.reimbursementValid ? "Approved" : "Rejected"}
                    </span>
                    {r.decisionReason ? (
                      <span
                        className="text-xs dark:text-zinc-400 text-zinc-600 truncate"
                        title={r.decisionReason}
                      >
                        {r.decisionReason}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-md ${
                        r.ok
                          ? "bg-violet-600 text-white"
                          : "dark:bg-zinc-700 bg-zinc-200"
                      }`}
                    >
                      {r.ok ? "Paid" : "Not Paid"}
                    </span>
                    {r.transactionHash ? (
                      <span
                        className="text-xs font-mono truncate"
                        title={r.transactionHash}
                      >
                        {r.transactionHash.slice(0, 10)}…
                        {r.transactionHash.slice(-6)}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-[10px] dark:text-zinc-500 text-zinc-500">
                    {new Date(r.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "estimator" && <EmployeeEstimator />}
      {tab === "status" && <StatusGuide />}
      {tab === "faq" && <FAQ />}
    </div>
  );
}
