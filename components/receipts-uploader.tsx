"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SpinnerIcon } from "./icons";
import { ArrowUpIcon } from "./icons";
import Image from "next/image";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { useActiveWallet } from "thirdweb/react";
import { client } from "../lib/thirdweb.client";

export default function ReceiptsUploader() {
  const wallet = useActiveWallet();
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
      toast.error("El archivo debe ser una imagen");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Máximo 5MB");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onUpload = async () => {
    if (!file) {
      toast.error("Selecciona una imagen para subir");
      return;
    }
    if (!wallet) {
      toast.error("Inicia sesión con tu wallet para continuar");
      return;
    }

    try {
      setIsUploading(true);
      setJsonResult(null);
      const formData = new FormData();
      formData.append("file", file);

      const fetchWithPayment = wrapFetchWithPayment(
        fetch,
        client,
        wallet
      ) as typeof globalThis.fetch;

      const res = await fetchWithPayment("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al subir el recibo");
      }

      const data = await res.json();
      setJsonResult(data);
      toast.success("Auditoría completada");
      setFile(null);
      setPreviewUrl(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-24 w-full max-w-xl px-4">
      <h2 className="text-2xl font-bold mb-4">Receipts</h2>
      <div className="flex flex-col gap-4 p-4 rounded-2xl dark:bg-zinc-800 bg-zinc-100">
        <div
          className={
            `relative flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed ` +
            (isDragging
              ? `border-zinc-400 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900`
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
              <div className="size-10 flex items-center justify-center rounded-full dark:bg-zinc-700 bg-zinc-200 mb-2">
                <ArrowUpIcon />
              </div>
              <div className="font-medium">Arrastra y suelta tu recibo</div>
              <div className="text-sm dark:text-zinc-400 text-zinc-500">
                o haz clic para seleccionar
              </div>
              <div className="text-xs mt-2 dark:text-zinc-500 text-zinc-400">
                JPEG, PNG, WEBP • Máximo 5MB
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
                    className="text-xs px-2 py-1 rounded-md dark:bg-zinc-700 bg-zinc-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Quitar
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

        <div className="flex justify-end">
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
            <span>{isUploading ? "Subiendo" : "Subir"}</span>
          </button>
      </div>
      </div>
      {jsonResult !== null && (
        <div className="mt-6 w-full max-w-xl px-4">
          <div className="p-4 rounded-2xl dark:bg-zinc-800 bg-zinc-100 text-sm whitespace-pre-wrap">
            {JSON.stringify(jsonResult, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}
