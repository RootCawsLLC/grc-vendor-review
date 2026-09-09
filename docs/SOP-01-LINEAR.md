# SOP 01 — Linear: the vendor-review queue

**Goal.** Make Linear the system of record for vendor reviews: one place with a
status, an owner, the evidence, and the decision. Claude writes its outcome
here (SOP-02); humans close it here.

**Who runs this.** A Linear workspace admin.

**Time.** ~30 minutes.

**Why Linear and not the Slack thread.** A Slack thread has no owner, no due
date, no searchable history, and its membership is its access control. A vendor
review is a work item someone will ask about months later ("what did we approve
for ExampleCo, and on what evidence?"). That is a ticket, not a thread.

---

## Step 1 — Create (or choose) a team

- [ ] In Linear, create a team named **Vendor Review** (or use an existing GRC
      team). Team key can be `VR`.
- [ ] Note the team key. It appears in issue IDs like `VR-123`. You will use it
      in SOP-02 and SOP-03.

If your org already tracks vendor work in a team, use that one instead of
making a second queue. One queue, not two.

---

## Step 2 — Define the three workflow states

The skill returns exactly three outcomes. Linear needs a state for each so the
write-back in SOP-02 has somewhere to land. In **Team settings → Workflow**,
create these states (types in parentheses are Linear's state categories):

- [ ] **Intake** (Unstarted) — issue filed, not yet reviewed
- [ ] **In Review** (Started) — Claude is reviewing, or a human is
- [ ] **Approved** (Completed)
- [ ] **Approved with Risks** (Started or a custom "Completed" — see note)
- [ ] **Rejected** (Cancelled)

**Note on "Approved with Risks."** It is not "done." It means a human must act
on specific items before the vendor is cleared. Keep it in a **Started**
category (not Completed) so it stays on the active board until the human-review
sub-items are closed. If your org insists on a Completed category, that is a
policy choice — record it.

If you cannot create custom states, map to the closest existing ones and write
the mapping down; SOP-02's bundle instructions must match whatever you choose.

---

## Step 3 — Labels

In **Team settings → Labels**, add:

- [ ] `vendor-review` — every issue in this flow
- [ ] `exposure:high` and `exposure:low` — set by the operator at intake
- [ ] `status:approved`, `status:approved-with-risks`, `status:rejected` —
      optional mirrors of the state, useful for filtering and reporting

Labels are for filtering and metrics. The **state** is the source of truth for
where an issue is.

---

## Step 4 — Intake template

Create an issue template so every request captures the same facts. In
**Team settings → Templates → New template**, name it **Vendor review** and set
the description to:

```
## Vendor
- Legal name:
- Product / service being purchased:

## Engagement
- Data the vendor will store, process, or read:
- Access to our systems (none / isolated export / API read / API write / production / admin):
- Exposure (high / low):

## Evidence attached
- [ ] SOC 2
- [ ] ISO 27001 certificate
- [ ] Penetration test
- [ ] Security questionnaire
- [ ] DPA / contract security exhibit
- [ ] Other:

## Owner
- Review owner (person who closes the human-review items):
```

- [ ] Set the template's default label to `vendor-review`
- [ ] Set the template's default state to **Intake**

---

## Step 5 — Connect Linear to Slack (so `@Linear` can file from a thread)

- [ ] In Linear, install the **Slack** integration
      ([linear.app/docs/slack](https://linear.app/docs/slack))
- [ ] In the private review channel (created in SOP-02), run
      `/invite @Linear`
- [ ] Confirm you can file from Slack:
      `@Linear file a vendor review for TestCo` should create an issue in the
      Vendor Review team

`@Linear` files and updates issues. It does **not** perform the security
review — that is `@Claude` in SOP-02/03.

---

## Step 6 — Decide how Claude writes back

Claude Tag will post its report onto the issue and set the state (SOP-02
connects the credential; the skill's Step 7 does the write). Decide now:

- [ ] Which state each outcome maps to (defaults: Approved → **Approved**,
      Approved with Risks → **Approved with Risks**, Rejected → **Rejected**)
- [ ] Whether Claude creates a **sub-issue per human-review item** (recommended)
      or a checklist in one comment
- [ ] Who the default **review owner** is when a request does not name one

Write these three answers at the top of the team's description. SOP-02's bundle
instructions must repeat them so Claude follows the same mapping.

---

## Done when

- [ ] A **Vendor review** template exists and files into **Intake**
- [ ] The three outcome states exist
- [ ] `@Linear` can file an issue from the private Slack channel
- [ ] The outcome→state mapping and default owner are written in the team
      description

Next: **[SOP-02 — Claude Tag](SOP-02-CLAUDE-TAG.md)** installs the reviewer and
connects it to this queue.
