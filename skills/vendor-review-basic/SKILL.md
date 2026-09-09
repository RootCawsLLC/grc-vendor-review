---
name: vendor-review-basic
description: >-
  Runs a first-pass vendor security review against submitted evidence (SOC 2,
  ISO 27001, penetration test reports, security questionnaires, DPAs) and
  public sources, returning Approved, Approved with Risks, or Rejected plus a
  short vendor summary and cited findings. Use when a vendor packet is submitted
  for review, when asked to review a vendor, SOC 2, ISO certificate, pen test,
  DPA, or security questionnaire, or when procurement needs a go/no-go before
  the full vendor risk assessment.
---

# Vendor review (basic)

First-pass security review of a third-party vendor. Return **Approved**,
**Approved with Risks**, or **Rejected**, a short vendor summary, and the
findings that produced the call.

This is a pre-step to a full vendor risk assessment. Do not assign a vendor
tier, quantify loss exposure, or score controls individually. Do not mention
auditors or the review process in the report; the findings table with
per-finding source citations is the trail.

## Inputs

Use what is present. Do not stall for a complete packet.

- Vendor legal name and product / service being purchased
- Intended use, data types, and access (if stated; infer only from the packet
  and the user's message, and mark inferred facts)
- Attached evidence: SOC 2, ISO 27001, penetration test, questionnaire, DPA,
  security whitepaper, insurance certificate, contract clauses
- Public sources you can actually retrieve

If the user names a vendor and attaches nothing, still attempt public sources,
then apply the no-evidence rule in Step 5.

## Procedure

Copy this checklist and tick as you go:

```
- [ ] Step 1 — Engagement
- [ ] Step 2 — Evidence inventory
- [ ] Step 3 — Read each artifact
- [ ] Step 4 — Public sources
- [ ] Step 5 — Decision
- [ ] Step 6 — Report
```

### Step 1 — Engagement

Record:

- Product / service in scope of the purchase
- Data the vendor will store, process, or read
- Access to our systems (none / isolated export / API / production / admin)
- Whether the engagement is **high-exposure** or **low-exposure**

**High-exposure** if any of these are true (or unknown — unknown is not low):

- Confidential or regulated data: employee personal data, end-user personal
  data, customer content, source code, production telemetry, financial records,
  credentials/secrets, protected health information, cardholder data
- Production or privileged access: write to production or the warehouse,
  admin access to infrastructure/cloud/IdP

**Low-exposure** only when data is none / public / marketing, and access is
none or isolated export we control, and those facts are stated — not guessed.

If engagement facts are missing, treat the engagement as high-exposure for
the no-evidence rule.

### Step 2 — Evidence inventory

List every artifact submitted and every public source attempted. For each:

| Artifact | Date / period | Usable? | Notes |
|---|---|---|---|
| … | … | yes / no / not verified | … |

**Usable** means you could read it and it speaks to the product in some way.

**Not Verified** (not a finding): the source exists but you could not retrieve
it — gated trust center, login wall, expired link, paywall, broken PDF. Put it
in the inventory. Do not invent contents. Do not treat an unreachable source
as a satisfied control.

An expired, blank, or clearly-wrong-company document is **not usable**.

### Step 3 — Read each artifact

Extract facts with page, section, or URL citations. Do not mark a control met
because a heading exists; quote or paraphrase the statement that supports the
finding.

**SOC 2 report**

- Opinion type (unmodified / qualified / adverse / disclaimer)
- Type (1 vs 2) and period end
- System description: does it **name** the product being purchased?
- Notable exceptions, complementary user-entity controls that shift work to us
- Whether encryption, MFA, access reviews, logging, vulnerability management,
  incident notification, and subprocessors are described for this system

If the report does not name products, do **not** call a scope mismatch. Many
reports describe a platform without product names. Scope mismatch is only a
finding when the report lists products / services and the purchase is not
among them.

**ISO/IEC 27001 certificate** (and Statement of Applicability if present)

- Validity dates
- Scope statement vs the purchase
- Certification body is identifiable

**Penetration test**

- Date, tester independence, scope vs the purchase
- Open Critical or High findings, and any remediation evidence in the packet
- Tenant-isolation results if the service is multi-tenant

**Security questionnaire**

- Unanswered items are `unknown`, not pass
- Contradictions with the attestation or with public sources are findings

**DPA / contract security exhibit**

- Breach-notification period
- Deletion / return on termination
- Subprocessor notice
- Region / transfer terms if data leaves the stated region

**Insurance certificate** — presence and limit if provided; absence is a gap
only when the engagement is high-exposure.

### Step 4 — Public sources

Attempt, and record the URL plus retrieved-at date:

- Vendor security page / ungated trust center
- `/.well-known/security.txt` and any vulnerability-disclosure policy
- Public status page
- CSA STAR registry listing for the service
- Recent, attributable breach or ransomware reporting on this legal entity

Gated trust centers stay **Not Verified**. Do not ask the user to paste
credentials. News that you cannot attribute to this legal entity is omitted,
not a finding.

### Step 5 — Decision

Evaluate **every** trigger below. Status is the **highest-severity trigger
that fired**. One rejection trigger rejects. Good evidence does not average
out bad evidence.

`unknown` is never a pass. A missing document, unanswered question, or
unreachable trust center is a gap.

#### Rejected — any one of these

1. **No usable evidence, high-exposure.** Zero usable artifacts (Step 2) and
   the engagement is high-exposure or exposure is unknown. Status reason:
   "insufficient evidence does not support an approval."
2. **Attestation opinion is qualified, adverse, or a disclaimer of opinion.**
3. **Attestation expired more than 90 days** (SOC 2 period end, or ISO
   certificate expiry) with no successor artifact in the packet.
4. **Independent pentest in the packet shows open Critical or High findings**
   and the packet has no remediation evidence for those items.
5. **Encryption at rest or in transit is absent or unknown** and the vendor
   will hold confidential or regulated data.
6. **MFA for vendor staff access to production or customer data is absent or
   unknown** and those systems are in scope.
7. **Confirmed material incident** in the last 24 months affecting customer
   data, with no remediation or customer-notification evidence in the packet
   or in attributable public sources.

#### Approved with Risks — not Rejected, and any one of these

1. **No usable evidence, low-exposure.** Zero usable artifacts on a stated
   low-exposure engagement. Name the evidence gap.
2. **Any in-scope control area left `unknown`.** In-scope areas: independent
   attestation, attestation scope vs purchase, encryption in transit, encryption
   at rest, MFA, access review, audit logging, vulnerability remediation,
   incident notification, subprocessors, data deletion/return. An area is
   in-scope when the engagement could touch it (high-exposure includes all of
   them; low-exposure includes attestation and incident notification only).
3. **Attestation is current but the named-product scope does not include the
   purchase** (only when the report actually names products).
4. **Attestation expires within 90 days** and no successor is in the packet.
5. **Pentest older than 12 months**, or no pentest in a high-exposure
   engagement.
6. **Public sources attempted and unreachable** (gated trust center, dead
   security page) — list them as Not Verified gaps, not as control failures.
7. **Incident notification longer than 72 hours, or unknown**, on a
   high-exposure engagement.
8. **SSO not available on the plan being purchased**, when we will have user
   accounts in the product.
9. **No public vulnerability disclosure path** found (no security.txt, no VDP)
   on a high-exposure engagement.
10. **Questionnaire or DPA contradicts** the attestation or a public source.
11. **Open Medium pentest findings** without remediation evidence.

#### Approved — all of these, and no trigger above

- At least one usable, current independent attestation (SOC 2 Type 2 period
  ending within 15 months, or ISO 27001 certificate unexpired) that can
  reasonably be read as covering this service
- In-scope control areas are evidenced as present, not `unknown`
- No open Critical/High pentest findings without remediation
- No rejection trigger and no Approved-with-Risks trigger

Current means: SOC 2 Type 2 period end within 15 months of today, or ISO
certificate not past its stated expiry. A Type 1 alone is not sufficient for
Approved; it can support Approved with Risks if nothing rejects.

### Step 6 — Report

Use the template below. Fill every section that applies. Omit **Items for
Human Review** entirely when the status is Approved. On the other two
statuses, that section lists the specific things a human has to look at —
do not bury them in prose.

Cite sources on every finding (document filename + page/section, or URL).
If you cannot cite it, it is not a finding; it is `unknown`.

Do not mention auditors, sampling, or how the review was performed.

## Report template

```markdown
# Vendor review — {legal name}

**Status:** Approved | Approved with Risks | Rejected
**Product / service:** {name}
**Engagement:** {one line: data + access + high/low exposure}
**As of:** {ISO date}

## Vendor summary

{5–8 sentences. What they sell, who they are, what evidence was usable,
what the call turned on. No recommendations-as-status.}

## Evidence reviewed

| Artifact | Date / period | Usable? | Source |
|---|---|---|---|
| {name} | {date} | yes / no / not verified | {file or URL} |

## Findings

| Area | Finding | Severity | Source |
|---|---|---|---|
| {area} | {fact, not a restatement of the status} | reject / risk / note | {cite} |

Severity: `reject` = a rejection trigger; `risk` = an Approved-with-Risks
trigger; `note` = context that did not move the status.

## Items for Human Review

{Omit this entire section when Status is Approved.}

- {specific item: document to obtain, clause to negotiate, contradiction to
  resolve, unreachable source to fetch by login}
- {…}

## Status reason

{One short paragraph naming the highest-severity trigger that fired, or
stating that no trigger fired.}
```

## Limits

- You cannot read a gated trust center. Anything behind a login is
  **Not Verified**, not a finding and not a pass.
- SOC 2 scope-vs-purchase mismatch requires the report to name the product.
  If it does not, do not infer mismatch from silence.
- Do not fetch or request credentials, internal ticket systems, or live
  production access.
- Do not copy questionnaire or attestation wording into the report beyond
  the short cited fact needed to support a finding.
- If the packet is a screenshot or a marketing PDF with no control facts,
  it is not usable evidence.
