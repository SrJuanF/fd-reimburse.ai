<p align="center">
  <img src="app/reimburse-removebg-preview.png" alt="Reimburse.ai" width="420">
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

## Currently Features

### Secure Payment Flow with x402

- **Pre-verification**: Verify signed payment data before processing requests
- **Maximum Amount Protection**: Set a max token limit to cap potential costs
- **Post-inference Settlement**: Charge only for actual tokens used
- **Onchain Payments**: Paid in the token and chain of your choice with gasless transactions

## How It Works

This template demonstrates a complete pay-per-token flow:

1. **Payment Verification** (`verifyPayment`)

   - User signs payment authorization with maximum amount
   - Server verifies signature before processing request
   - Prevents unauthorized inference calls

2. **AI Inference** (`streamText`)

   - Process chat request and stream AI response to user
   - Non-blocking payment flow ensures optimal UX
   - Extract token usage via `onFinish` callback

3. **Asynchronous Settlement** (`settlePayment`)

   - Calculate final price: `PRICE_PER_INFERENCE_TOKEN_WEI × totalTokens`
   - Settle payment on-chain after streaming completes
   - Only charge for actual tokens consumed

4. **Cost Display**
   - Stream token metadata to frontend via `messageMetadata`
   - Display cost card below each AI response
   - Full transparency for users

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
      network: arbitrum,
      price: { amount: finalPrice.toString(), asset: usdcAsset },
      // ... other params
    });
  },
});
```

**Frontend - Cost Display** (`components/messages.tsx`):

```typescript
const totalTokens = metadata?.totalTokens;
const costInUsdc = (PRICE_PER_INFERENCE_TOKEN_WEI * totalTokens) / 10 ** 6;
```

### Tech Stack

- [Next.js](https://nextjs.org) App Router for server-side rendering and performance
- [Vercel AI SDK](https://sdk.vercel.ai/docs) for LLM API and streaming
- [thirdweb x402](https://thirdweb.com/x402) for HTTP micropayments and payment infrastructure

## Running Locally

### Prerequisites

You will need the following API keys and environment variables:

- **AI Provider API Keys**: Anthropic, Fireworks, or Groq (depending on which model you want to use)
- **thirdweb Credentials**: For x402 payment infrastructure
  - Get your secret key from [thirdweb dashboard](https://thirdweb.com/dashboard)
  - Client ID for frontend wallet connection

### Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd x402-ai-inference
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# AI Provider API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key

# thirdweb Configuration
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
THIRDWEB_SERVER_WALLET_ADDRESS=your_server_wallet_address
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

> **Important**: Never commit your `.env.local` file. It contains secrets that will allow others to control access to your AI provider and thirdweb accounts.

4. **Configure pricing** (Optional)

Edit `lib/constants.ts` to adjust your pricing:

```typescript
export const PRICE_PER_INFERENCE_TOKEN_WEI = 1; // 0.000001 USDC per token
export const MAX_INFERENCE_TOKENS_PER_CALL = 1000000; // 1M tokens max
```

You can also change the chain and token used for the payment in that file.

5. **Start the development server**

```bash
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

### Testing Payments

1. Connect a wallet with USDC on Arbitrum
2. Send a chat message to trigger an AI inference
3. The app will:
   - Verify your payment signature
   - Stream the AI response
   - Settle payment based on actual tokens used
   - Display the cost below the response

## Learn More

- [x402 thirdweb Documentation](https://portal.thirdweb.com/x402)
