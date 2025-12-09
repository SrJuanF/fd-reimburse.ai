"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SpinnerIcon } from "./icons";
import { ArrowUpIcon } from "./icons";
import Image from "next/image";
//import { wrapFetchWithPayment } from "thirdweb/x402";
//import { client } from "../lib/thirdweb.client";
import { useActiveAccount } from "thirdweb/react";

export default function ReceiptsUploader({
  onUploaded,
}: {
  onUploaded?: () => void;
}) {
  const activeAccount = useActiveAccount();
  const addr = activeAccount?.address?.toLowerCase();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [jsonResult, setJsonResult] = useState<unknown | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      toast.error("The file must be an image");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Maximum size 5MB");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onNotification = (json: any) => {
    if (
      json &&
      typeof json === "object" &&
      "ok" in json &&
      (json as any).ok === false
    ) {
      const err =
        typeof (json as any).error === "string"
          ? (json as any).error
          : "Upload failed";
      toast.error(err);
      return;
    }
    setJsonResult(json);
    const reimbursementValid = Boolean(json?.data?.reimbursementValid);
    const decisionReason =
      typeof json?.data?.decisionReason === "string"
        ? json.data.decisionReason
        : "";
    const paidOk = Boolean(json?.reimburseData?.ok);
    const txHash =
      typeof json?.reimburseData?.transactionHash === "string"
        ? json.reimburseData.transactionHash
        : "";

    toast.success(
      `${reimbursementValid ? "Approved" : "Rejected"}${
        decisionReason ? ": " + decisionReason : ""
      }`
    );
    if (paidOk || txHash) {
      toast.message(
        `${paidOk ? "Paid" : "Not Paid"}${
          txHash ? ` • ${txHash.slice(0, 10)}…${txHash.slice(-6)}` : ""
        }`
      );
    }
  };

  const onUpload = async () => {
    if (!file) {
      toast.error("Select an image to upload");
      return;
    }
    if (!addr) {
      toast.error("Sign in with your wallet to continue");
      return;
    }

    try {
      setIsUploading(true);
      setJsonResult(null);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("employee", addr);

      /*const fetchWithPayment = wrapFetchWithPayment(
        fetch,
        client,
        wallet
      ) as typeof globalThis.fetch;
      const res = await fetchWithPayment("/api/chat", {
        method: "POST",
        body: formData,
      });*/
      const res = await fetch("/api/treasure/receipts", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to upload receipt");
      }

      const json = await res.json();

      onNotification(json);

      setFile(null);
      setPreviewUrl(null);
      onUploaded?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-6 w-full max-w-xl px-2">
      <div className="flex flex-col gap-4 p-3 rounded-2xl dark:bg-zinc-900 bg-white border dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 flex items-center justify-center rounded-md dark:bg-zinc-800 bg-zinc-200">
              <ArrowUpIcon />
            </div>
            <div className="text-sm font-semibold">Upload Receipt</div>
          </div>
          <button
            className="text-sm px-3 py-1.5 rounded-md dark:bg-zinc-800 bg-zinc-100"
            onClick={() => {
              const input = document.getElementById(
                "receipt-file-input"
              ) as HTMLInputElement | null;
              input?.click();
            }}
          >
            Browse
          </button>
        </div>

        <div
          className={
            `relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed ` +
            (isDragging
              ? `border-zinc-400 dark:border-zinc-600 bg-zinc-950/40`
              : `border-zinc-300 dark:border-zinc-700`)
          }
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (!f) return;
            const fakeEvent = {
              target: { files: [f] },
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onFileChange(fakeEvent);
          }}
          onClick={() => {
            const input = document.getElementById(
              "receipt-file-input"
            ) as HTMLInputElement | null;
            input?.click();
          }}
        >
          {!previewUrl ? (
            <div className="flex flex-col items-center text-center">
              <div className="size-10 flex items-center justify-center rounded-full dark:bg-zinc-800 bg-zinc-200 mb-2">
                <ArrowUpIcon />
              </div>
              <div className="font-medium">Drag and drop your receipt</div>
              <div className="text-sm dark:text-zinc-400 text-zinc-500">
                or click to select
              </div>
              <div className="text-xs mt-2 dark:text-zinc-500 text-zinc-400">
                JPEG, PNG, WEBP • Max 5MB
              </div>
            </div>
          ) : (
            <div className="w-full">
              <Image
                src={previewUrl}
                alt="Preview"
                width={600}
                height={400}
                className="max-h-64 w-full object-contain rounded-md h-auto"
              />
              {file && (
                <div className="mt-2 text-sm flex items-center justify-between">
                  <span className="truncate">{file.name}</span>
                  <button
                    className="text-xs px-2 py-1 rounded-md dark:bg-zinc-800 bg-zinc-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          <input
            id="receipt-file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg dark:bg-zinc-100 bg-zinc-900 dark:text-zinc-900 text-zinc-100 disabled:opacity-50"
            onClick={onUpload}
            disabled={isUploading || !file}
          >
            {isUploading ? (
              <span className="animate-spin">
                <SpinnerIcon />
              </span>
            ) : null}
            <span>{isUploading ? "Uploading" : "Upload"}</span>
          </button>
        </div>
      </div>
      {/*jsonResult !== null && (
        <div className="mt-6 w-full max-w-xl px-4">
          <div className="p-4 rounded-2xl dark:bg-zinc-800 bg-zinc-100 text-sm whitespace-pre-wrap">
            {JSON.stringify(jsonResult, null, 2)}
          </div>
        </div>
      )*/}
    </div>
  );
}
