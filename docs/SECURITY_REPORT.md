# Security Analysis Report

Date: 2025-12-12  
Scope: npm audit + manual review of Supabase edge functions, auth handling, and payment flows.

## Baseline checks
- `npm run lint` (fails): existing `any` usage and hook ordering issues in multiple `src/pages/*` files and Supabase functions.
- `npm run build` (passes): bundle size warning only.

## Automated findings
- **Moderate – esbuild / Vite dev server request forgery** (GHSA-67mh-4wv8-2f99) via `vite@5.4.19` → transitive `esbuild@0.24.2` (`npm audit`). Fix: upgrade Vite to ≥7.2.7 (major) which pulls patched esbuild.
- **Moderate – mdast-util-to-hast unsanitized class attribute** (GHSA-4fh9-h7wg-q85m) in `mdast-util-to-hast@13.1.x` (`npm audit`). Fix: bump remark/rehype pipeline to `mdast-util-to-hast` 13.2.1+.
- `npm audit` totals: 3 moderate, 0 high/critical.

## Manual code review findings
- **High – Unauthenticated Meta Conversion API** (`supabase/functions/meta-conversion-api/index.ts`): open CORS (`*`), no auth, uses server-side `META_ACCESS_TOKEN` and returns 200 even on failure. Anyone can send arbitrary events/PII to the configured pixel (default ID provided), risking data poisoning and token abuse. *Mitigation:* require auth or signed requests, restrict allowed origins, remove default pixel ID, and return non-200 on errors.
- **Medium – Broad CORS on privileged Supabase functions** (`create-ccavenue-order`, `store-research-request`, `delete-user-account`, `validate-access-code`, `ccavenue-response`): `Access-Control-Allow-Origin: *` with `Authorization` allowed. Combined with bearer tokens stored in the browser, cross-site scripts can invoke privileged actions (order creation, account deletion). *Mitigation:* restrict origins, consider CSRF protections or signed nonces for state-changing calls.
- **Medium – Sensitive data logging**:
  - `store-research-request/index.ts` logs idea titles/descriptions, order IDs, and full CCAvenue responses.
  - `create-ccavenue-order/index.ts` logs request strings/previews that can include user email/plan info and credential lengths.
  - `ccavenue-response/index.ts` logs decrypted gateway responses (card_name, tracking IDs, amounts).
  - `meta-conversion-api/index.ts` logs incoming event data.  
  These logs can leak PII/payment details in observability backends. *Mitigation:* remove or redact PII, log only minimal identifiers.
- **Medium – Account deletion hardness** (`delete-user-account/index.ts`): relies solely on bearer token with `*` CORS and no re-auth/step-up check; a stolen token enables irreversible deletion. *Mitigation:* require recent re-auth or signed one-time confirmation, and origin restrictions.
- **Medium – Token storage in `localStorage`** (`src/integrations/supabase/client.ts`): Supabase sessions persist in `localStorage`, making them accessible to XSS. *Mitigation:* prefer httpOnly/secure cookies or tighten CSP and input sanitization to reduce XSS risk.
- **Low – Credential footprint in logs**: CCAvenue credential presence/length and request previews are logged; while truncated, secrets still hit logs. *Mitigation:* remove credential logging in production.
- **Operational note**: `bundle chunk >500 kB` warning is not a vulnerability but suggests reviewing code-splitting to reduce attack surface and payload.

## Recommended next steps
1) Plan dependency upgrades (Vite 7.x, patched mdast/rehype stack) to clear known CVEs.  
2) Add auth/origin enforcement and error handling to `meta-conversion-api`; remove default pixel ID.  
3) Restrict CORS to trusted origins on Supabase functions and add CSRF/signed-request checks for state-changing endpoints.  
4) Redact or remove PII/payment logging across Supabase functions; ensure payment gateway responses are not persisted in logs.  
5) Require step-up auth for account deletion and consider short-lived deletion tokens.  
6) Move Supabase session storage to secure cookies or strengthen XSS defenses before continuing with `localStorage`.
