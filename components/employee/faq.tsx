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

