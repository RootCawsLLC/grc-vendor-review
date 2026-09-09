# SOP 03 — Run a vendor review (operator runbook)

**For.** Procurement and GRC operators. You do not need to know how any of it is
wired — that is SOP-01 and SOP-02. This is the day-to-day.

**What you get.** A first-pass decision — **Approved**, **Approved with Risks**,
or **Rejected** — with cited findings, recorded on a Linear issue.

**What this is not.** It is not the full vendor risk assessment (no tier, no
dollar figure). It is the fast go/no-go before that.

---

## Before you start

- [ ] You are in the private **#vendor-review** Slack channel
- [ ] You have the vendor's evidence files (SOC 2, ISO cert, pen test,
      questionnaire, DPA — whatever exists)
- [ ] You know what data the vendor will hold and what access they get

**Handling the files.** These documents are often under NDA. Only ever upload
them in the private review channel. Never forward them to a public channel, a
DM, or another workspace.

---

## Step 1 — File the ticket

In the channel:

```
@Linear file a vendor review for <Vendor legal name>, product <product>. Owner: <you or the reviewer>.
```

Or create it in Linear directly from the **Vendor review** template. Either way
you get an issue ID like `VR-123`. That ID is how everything stays tied
together.

Fill in the template fields: data types, access, and exposure (high or low).
When unsure whether it is high or low exposure, leave it — the reviewer treats
unknown exposure as high, which is the safe default.

---

## Step 2 — Ask for the review

Reply **in a thread on that request**, name the issue ID, and attach the files:

```
@Claude first-pass vendor review for <Vendor>, product <product>, tracked in VR-123.
They will hold <data types> and have <access>. Packet attached.
```

Attach the evidence files to that same message.

Tips:

- If you have no documents, still ask — Claude will check public sources and
  tell you what is missing.
- One vendor per thread. Start a new thread for the next vendor.
- Anyone in the channel can reply in the thread to steer the same review.

---

## Step 3 — Read the outcome

Claude posts the report in the thread **and** as a comment on `VR-123`, and sets
the issue status. The report has:

- **Status** — Approved / Approved with Risks / Rejected
- **Vendor summary** — what they do and what the call turned on
- **Evidence reviewed** — what was usable, and what could not be verified
- **Findings** — each with a citation to a file or URL
- **Items for Human Review** — only on Approved with Risks and Rejected

What each status means for you:

| Status | What it means | Your next move |
|---|---|---|
| **Approved** | Usable current evidence, nothing outstanding | Proceed per normal procurement |
| **Approved with Risks** | OK to proceed **once** the listed items are handled | Work the human-review sub-issues; the owner closes them |
| **Rejected** | Evidence does not support approval | Do not proceed; the findings say why |

"Approved with Risks" is the common result for thin packets, on purpose — a
missing document is a gap, not a pass. It is not a soft yes; it is "a human must
look at these specific things first."

---

## Step 4 — Close the loop (owner)

The review **owner** (named at intake) handles the sub-issues Claude created:
get the missing document, negotiate the clause, resolve the contradiction. When
they are done:

- [ ] Each human-review sub-issue is resolved
- [ ] The owner sets the final state on `VR-123`

**Claude never closes the issue.** A person does. That is deliberate — the
record should show a human made the call.

---

## Common situations

**"It says Not Verified for their trust center."** Claude cannot log into a
gated trust center. That is a gap to chase (someone with access exports the
report and attaches it), not a failure by the vendor. Re-run with the document
attached.

**"The SOC 2 doesn't mention the product we're buying."** Many reports describe
a platform without naming products. Claude only flags a scope mismatch when the
report actually lists products and yours is not among them. If in doubt, ask the
vendor which report covers the product.

**"We only have a security questionnaire, no SOC 2."** That is usually Approved
with Risks with the attestation gap named. Whether that is acceptable is a human
decision — that is what the human-review items are for.

**"Claude didn't respond."** Check you tagged `@Claude` in the channel (not a
DM), and that you are in `#vendor-review`. If it is still silent, tell whoever
ran SOP-02 — it is usually a spend limit or a bundle setting, not you.

**"The report is in Slack but not on the Linear issue."** Make sure you put the
issue ID (`VR-123`) in your request. If it still does not post, flag the SOP-02
owner — the Linear connector may need attention.

---

## The one rule

If it is not on the Linear issue, it did not happen. The Slack thread is a
convenience; the issue is the record. Always include the issue ID when you ask.
