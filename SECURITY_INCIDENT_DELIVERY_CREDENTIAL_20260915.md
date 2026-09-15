# Delivery Credential Security Incident — Sanitized Evidence

- Incident: `HANDOFF-DELIVERY-CREDENTIAL-SECURITY-INCIDENT-20260915`
- Time basis: Hong Kong time (HKT, UTC+8)
- Secret handling: no credential value, customer data, or PII is recorded in this file.

## 2026-09-15 11:23:30 HKT — Preflight and target verification

- GitHub repository verified as public; default branch is `main`.
- Four public branch heads and two pull-request refs were identified for cleanup verification.
- A full PAT-shaped literal was present in `README.md` across 47 reachable commits, beginning with the initial 2026-03-14 history.
- The separate `.env.example` value is a placeholder and was not the credential-removal target.
- The exposed Airtable token was matched to the token named `Manus`; its access was limited to the `LKS Orders & Delivery` base with record read/write and base-schema-read scopes.
- The Railway production target was verified as service `lks-invoice-system`, domain `delivery.lksdisplaybox.online`, with the expected protected `AIRTABLE_API_KEY` variable.
- Dedicated task-owned browser sessions were authenticated to GitHub, Airtable, and Railway. No existing user browser tab was used or modified.

## 2026-09-15 11:24:17 HKT — Exposed credential revoked

- The Airtable token matched to the exposed credential was permanently deleted after explicit action-time confirmation.
- The Airtable token inventory decreased from seven to six entries and the revoked token was no longer present.
- Delivery entered the owner-approved temporary interruption window.
- No other Airtable token, base, record, or permission was changed.

## 2026-09-15 11:28:54 HKT — Replacement and Production recovery

- Created Airtable token `Delivery Production 2026-09` with access limited to the `LKS Orders & Delivery` base.
- Granted only `data.records:read` and `data.records:write`; the prior base-schema-read scope was intentionally omitted because the Delivery code calls record endpoints only.
- Wrote the replacement directly into the protected Railway `AIRTABLE_API_KEY` variable for `lks-invoice-system`; the secret was not stored in any file, log, Git object, message, or evidence record, and its in-memory copy was cleared immediately.
- Railway completed the variable-triggered Production deployment and returned the service to `Online`.
- Read-only QA succeeded: `/health` returned HTTP 200 with verified TLS, and the Airtable-backed `listOrders` query returned HTTP 200 JSON with no application error. Only response status and aggregate count were inspected; no record values, customer data, or PII were logged or retained.

## 2026-09-15 11:30:54 HKT — GitHub branch and history rewrite

- Confirmed one unique full PAT-shaped literal was the only rewrite target; it appeared once in each of 47 affected commits and had sanitized SHA-256 fingerprint prefix `dc3784266ba9`.
- Replaced only that full PAT-shaped literal in `README.md` throughout the retained history. The `.env.example` placeholder and all other repository files and non-sensitive work were preserved.
- Force-updated all four public branch heads: `main`, `codex/delivery-legacy-customer-link-hotfix-20260825`, `codex/delivery-public-link-auth-fix-20260825`, and `openclaw/capability-pilot-20260801`.
- A fresh remote clone verified zero full PAT-shaped matches across all public branch histories.
- The repository has zero forks.
- Two GitHub-managed, read-only pull-request refs still retain 45 old reachable commits. GitHub does not permit repository owners to update these refs; GitHub Support must dereference the two affected pull requests and clear cached views/server objects.
- First changed commit after the rewrite: `70e7ab50ca497db865485f4a28fe5bce9b28f9cd`.

## 2026-09-15 11:35:24 HKT — GitHub Support escalation

- Submitted sanitized GitHub Support ticket `#4758735` requesting dereferencing/deletion of the two affected pull-request refs, server-side garbage collection, and removal of cached views/objects.
- The ticket includes the repository URL, affected PR-ref count and names, zero-fork confirmation, the first changed commit, and confirmation that the credential is revoked and branch history is clean.
- The ticket does not include the credential value, customer data, PII, or file attachments.
- Ticket status at submission: `open`.
