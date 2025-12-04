"use client";

import Link from "next/link";
import Image from "next/image";
import { SignInButton } from "./sign-in-button";

export default function AppHeader() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
  return (
    <div className="fixed right-0 left-0 w-full top-0 bg-white dark:bg-zinc-950 mx-auto">
      <div className="flex justify-between items-center p-4">
        <div className="flex flex-row items-center gap-2 shrink-0 ">
          <span className="jsx-e3e12cc6f9ad5a71 flex flex-row items-center gap-2 home-links">
            <Link
              className="text-zinc-800 dark:text-zinc-100 -translate-y-[.5px]"
              rel="noopener"
              target="_blank"
              href={baseUrl}
            >
              <Image src="/thirdweb.png" alt="Thirdweb Logo" width={48} height={48} />
            </Link>
            <h3 className="text-xl font-bold">Reimburse.ai</h3>
          </span>
        </div>
        <div className="flex flex-row items-center gap-4 shrink-0">
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
