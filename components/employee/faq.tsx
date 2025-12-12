"use client";

export default function FAQ() {
  const items = [
    {
      q: "How long does auditing take?",
      a: "Most receipts are audited within minutes. Complex cases may take longer.",
    },
    {
      q: "Which categories are supported?",
      a: "Typical categories include Food, Travel, and Office. Check company policy.",
    },
    {
      q: "How do liquidity advances work?",
      a: "If enabled, you may receive USDC in advance minus a small fee.",
    },
    {
      q: "My receipt was rejected. What can I do?",
      a: "Verify category, vendor, and date constraints or contact your admin.",
    },
    {
      q: "How do I verify my reimbursement?",
      a: (
        <span>
          You can track the transaction directly on the blockchain. Check your wallet history on Snowtrace:{" "}
          <a
            href="https://testnet.snowtrace.io/address/0xbaA900Cb2c63E340A70425E1f09f14D4280089ef/tokentxns"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            View on Explorer
          </a>
        </span>
      ),
    },
    {
      q: "How can I trust the AI Auditor?",
      a: (
        <span>
          Our auditor is verified via the ERC-8004 standard. You can view the on-chain registration proof here:{" "}
          <a
            href="https://testnet.snowtrace.io/tx/0xa72adde5517be2a9a38fb5d7771c274607cb529d2364b2a0b4dc0b214049546e?chainid=43113"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            View ERC-8004 Proof
          </a>
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900 bg-white">
      <div className="text-lg font-semibold">FAQ</div>
      <div className="mt-4 flex flex-col gap-3">
        {items.map((it) => (
          <div key={it.q} className="p-4 rounded-xl dark:bg-zinc-800 bg-zinc-100">
            <div className="text-sm font-medium">{it.q}</div>
            <div className="text-xs dark:text-zinc-400 text-zinc-600 mt-1">{it.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

