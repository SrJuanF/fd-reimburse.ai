# Reimburse.ai — Instant reimbursements with auditing and onchain payments

<p align="center">
  <img src="app/reimburse-architecture.jpg" alt="Reimburse.ai" width="420">
</p>

## Unified Business Model

- Core service: receipt auditing and reimbursement orchestration using Agent A (`app/api/auditor/route.ts`) and Agent B (`app/api/treasure/route.ts`).
- Add-on: optional “Receipts Advance” liquidity when companies have timing gaps; settlement from the company later with a fee.
- Audience: B2B offering (company as the customer), employees as beneficiaries with zero friction.

### Value

- Employees: instant reimbursements on valid receipts, reduced financial stress, transparent status.
- Companies: automated audit, fraud reduction, policy enforcement, faster close, optional liquidity bridge to smooth cash cycles.

### Flow

- Submit: employees upload the receipt to `app/api/treasure/receipts/route.ts:21`. The route forwards to Agent A with payment gating and then triggers reimbursement.
- Audit: Agent A validates and extracts fields, returns `reimbursementValid` and `decisionReason` (`app/api/auditor/route.ts:49`, `app/api/auditor/route.ts:105`).
- Pay: if valid, Agent B transfers USDC to the employee from the company’s server wallet (`app/api/treasure/route.ts:22`).
- Advance: if company liquidity is insufficient, platform advances funds from its reserve and records a receivable; company settles later under agreed terms.

### Pricing

- Base subscription (B2B, per company):
  - Basic: audit + dashboard, standard SLAs.
  - Pro: audit + automated payouts, budgets/policies, integrations, higher SLAs.
  - Enterprise: custom workflows, SSO, compliance add-ons, premium support.
- Usage-based audit fee: per audited receipt; present as a flat price while internally tracking compute cost. API supports usage-based pricing via `settlePayment` and token usage (`app/api/auditor/route.ts:134`).
- Payout orchestration fee: small per-transaction fee plus pass-through network costs for on-chain payments.
- Liquidity fee (Receipts Advance): origination 0.5%–2.0% per advanced amount, risk-adjusted by company credit profile. The fee is charged to the company, not the employee.
- Setup/integration fee: optional for enterprise onboarding.

### Who Pays

- Company pays subscription, audit, payout, and any liquidity fees.
- Employees do not pay; optionally allow company-configurable co-pay for instant payout if desired.

### Receipts Advance

- Facility: a revolving limit calculated from historical reimbursements, customer concentration, margins, and cash buffers.
- Terms: settlement T+7/T+15/T+30 with dynamic pricing based on utilization and risk.
- Controls: advance only audit-approved receipts; per-employee and per-period caps; category and vendor policies; reserve/holdback for higher-risk companies.
- Ledger: track outstanding advances, settlements, fees, and reconciliations in a transparent dashboard.

### Risk, KYC/KYB

- KYB/AML: verify the company, beneficial owners, sanctions screening, business registration, and bank accounts.
- Credit policy: assign limits, set triggers to pause advances if invoices are past due or limits exceeded.
- Payment verification: enforce authenticated server wallet actions (`x-secret-key`) and strict access control (`app/api/treasure/route.ts:10`).
- Fraud detection: policy enforcement in audit (date ceilings, amount limits), vendor/category whitelists, anomaly flags returned by Agent A (`app/api/auditor/route.ts:91`).

### Policy & Compliance

- Receipt rules: amount caps, date windows, allowed categories, acceptable proof; all configurable per company.
- Logs & retention: store audit outputs and decisions to support accounting and compliance.
- Employee privacy: minimize data collected and encrypt PII; only store necessary wallet or payout details.

### Implementation Alignment

- Payment gating: Agent A validates and settles payment before inferencing via `verifyPayment` and `settlePayment` (`app/api/auditor/route.ts:24`, `app/api/auditor/route.ts:144`).
- Orchestration: `treasure/receipts` calls auditor then, upon valid decision, triggers payout (`app/api/treasure/receipts/route.ts:50`, `app/api/treasure/receipts/route.ts:63`).
- Treasury: USDC payouts through the company’s server account (`app/api/treasure/route.ts:16`, `app/api/treasure/route.ts:22`).
- Next upgrades:
  - Pass audited `total` and employee wallet into the payout call to pay exact amounts instead of a fixed value.
  - Add a branch in `treasure/receipts` to choose “company-funded” vs “platform advance” based on company balance/limits.
  - Add rate cards and SKUs to make audit fees and payout fees visible and predictable for billing.

### Tiers

- Basic: audit + decision + manual payouts; pay-per-audit; monthly subscription.
- Pro: audit + automatic payouts + budgets/policies + integrations; subscription + pay-per-audit + payout fee.
- Pro + Advance: everything in Pro plus Receipts Advance; subscription + pay-per-audit + payout fee + liquidity fee; KYB and credit limit required.
- Enterprise: custom SLAs, compliance features, dedicated support, custom pricing.

### KPIs

- Approval rate, anomaly rate, average reimbursement time, % advanced vs company-funded, DSO on company settlements, fraud reduction, employee satisfaction.

### Next Steps

- Define pricing tables in app config to translate token usage to predictable per-receipt prices while keeping internal `settlePayment` logic intact.
- Add credit limit and advance decisioning to the `treasure/receipts` path, including a receivables ledger and settlement scheduler.
- Expose policy controls (amount caps, categories, vendor lists) in a company admin UI and enforce them in Agent A’s system prompt/pipeline.

### Key Code Snippets

**Backend - Token Extraction & Payment Settlement** (`app/api/chat/route.ts`):

```typescript
const stream = streamText({
  // ... model config
  onFinish: async (event) => {
    const totalTokens = event.totalUsage.totalTokens;
    const finalPrice = PRICE_PER_INFERENCE_TOKEN_WEI * totalTokens;

    await settlePayment({
      facilitator: twFacilitator,
      network: avalancheFuji,
      price: { amount: finalPrice.toString(), asset: usdcAsset },
      // ... other params
    });
  },
});
```

### Tech Stack

- [Next.js](https://nextjs.org) App Router for server-side rendering and performance
- [Vercel AI SDK](https://sdk.vercel.ai/docs) for LLM API and streaming
- [thirdweb x402](https://thirdweb.com/x402) for HTTP micropayments and payment infrastructure

## Running Locally

### Prerequisites

You will need the following API keys and environment variables:

- **AI Provider**: OpenAI (`gpt-4o`)
- **thirdweb Credentials**: For x402 payment infrastructure
  - Get your secret key from [thirdweb dashboard](https://thirdweb.com/dashboard)
  - Client ID for frontend wallet connection
  - Company server wallet address (USDC payouts)
  - Agent A server wallet address (facilitator)
  - Merchant wallet address (payTo)
  - Public API base URL

### Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd fd-reimburse.ai
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# AI Provider
OPENAI_API_KEY=your_openai_api_key

# thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
THIRDWEB_COMPANY_SERVER_WALLET_ADDRESS=your_company_server_wallet_address
THIRDWEB_AGENTA_SERVER_WALLET_ADDRESS=your_agent_a_server_wallet_address
THIRDWEB_AGENTA_MERCHANT_WALLET_ADDRESS=your_merchant_wallet_address

# Base URL
NEXT_PUBLIC_API_BASE_URL=https://your-app-name
```

> **Important**: Never commit your `.env.local` file. It contains secrets that will allow others to control access to your AI provider and thirdweb accounts.

4. **Configure pricing** (Optional)

Edit `lib/constants.ts` to adjust your pricing:

```typescript
export const PRICE_PER_INFERENCE_TOKEN_WEI = 1; // 0.000001 USDC per token
export const MAX_INFERENCE_TOKENS_PER_CALL = 10000; // 10k tokens max
export const paymentChain = avalancheFuji; // Avalanche Fuji testnet
export const paymentToken = getDefaultToken(paymentChain, "USDC")!; // USDC
```

This project uses Avalanche Fuji and USDC by default. You can change the chain and token in that file.

5. **Start the development server**

```bash
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

### Testing Payments

1. Connect a wallet with USDC on Avalanche Fuji (testnet)
2. Upload a receipt image of your expense

You can view transactions on Snowtrace.

## Learn More

- [Reimburse.ai Documentation](https://docs.google.com/document/d/1mBY_UQMdk58kroRE4Oup8vqoSRfGjsz7uKSfCImYDeg/edit?usp=sharing)
- [Reimburse.ai Video Demo](https://www.youtube.com/watch?v=wUI3uLoAJwY)
