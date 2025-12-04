"use client";

import cn from "classnames";
import { toast } from "sonner";
import { useState } from "react";
import { Footnote } from "./footnote";
import { SpinnerIcon, ArrowUpIcon } from "./icons";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { useActiveWallet } from "thirdweb/react";
import { client } from "../../lib/thirdweb.client";
import { Wallet } from "thirdweb/wallets";
import { SignInButton } from "./sign-in-button";
import Markdown from "react-markdown";
import { markdownComponents } from "./markdown-components";
import Image from "next/image";

export function Chat() {
  const wallet = useActiveWallet();
  if (!wallet) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-dvh">
        <h3 className="text-2xl font-bold">Sign in to continue</h3>
        <SignInButton />
      </div>
    );
  }
  return <ChatInner wallet={wallet} />;
}

function ChatInner(props: { wallet: Wallet }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const fetchWithPayment = wrapFetchWithPayment(
    fetch,
    client,
    props.wallet
  ) as typeof globalThis.fetch;

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

  const analyze = async () => {
    if (!file) {
      toast.error("Selecciona una imagen para analizar");
      return;
    }
    try {
      setIsAnalyzing(true);
      setResult("");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetchWithPayment("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al analizar el recibo");
      }

      const text = await res.text();
      setResult(text);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className={cn(
        "px-4 md:px-0 pb-4 pt-8 flex flex-col h-dvh items-center w-full max-w-3xl",
        {
          "justify-between": !!result,
          "justify-center gap-4": !result,
        }
      )}
    >
      <div className="flex flex-col gap-0.5 sm:text-2xl text-xl w-full">
        <div className="flex flex-row gap-2 items-center">
          <div>Audit your receipt image.</div>
        </div>
        <div className="dark:text-zinc-500 text-zinc-400 text-sm">
          Pay per token. No subscription.
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="flex relative flex-col gap-3 p-3 w-full rounded-2xl dark:bg-zinc-800 bg-zinc-100">
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
              const input = document.getElementById("receipt-file-input") as HTMLInputElement | null;
              input?.click();
            }}
          >
            {!previewUrl ? (
              <div className="flex flex-col items-center text-center">
                <div className="size-10 flex items-center justify-center rounded-full dark:bg-zinc-700 bg-zinc-200 mb-2">
                  <ArrowUpIcon />
                </div>
                <div className="font-medium">Arrastra y suelta tu recibo</div>
                <div className="text-sm dark:text-zinc-400 text-zinc-500">o haz clic para seleccionar</div>
                <div className="text-xs mt-2 dark:text-zinc-500 text-zinc-400">JPEG, PNG, WEBP • Máximo 5MB</div>
              </div>
            ) : (
              <div className="w-full">
                <Image src={previewUrl} alt="Preview" width={600} height={400} className="max-h-64 w-full object-contain rounded-md h-auto" />
                {file && (
                  <div className="mt-2 text-sm flex items-center justify-between">
                    <span className="truncate">{file.name}</span>
                    <button
                      className="text-xs px-2 py-1 rounded-md dark:bg-zinc-700 bg-zinc-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreviewUrl(null);
                        setResult("");
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            )}

            <input id="receipt-file-input" type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </div>

          <div className="flex justify-end">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg dark:bg-zinc-100 bg-zinc-900 dark:text-zinc-900 text-zinc-100 disabled:opacity-50"
              onClick={analyze}
              disabled={isAnalyzing || !file}
            >
              {isAnalyzing ? (
                <span className="animate-spin">
                  <SpinnerIcon />
                </span>
              ) : null}
              <span>{isAnalyzing ? "Analizando" : "Analizar"}</span>
            </button>
          </div>
        </div>

        {result && (
          <div className="flex flex-col gap-4 dark:bg-zinc-800 bg-zinc-100 p-4 rounded-2xl">
            <Markdown components={markdownComponents}>{result}</Markdown>
          </div>
        )}

        <Footnote />
      </div>
    </div>
  );
}
