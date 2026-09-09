# SOP 00 — Overview and order of operations

**Read this first.** It explains the whole setup in one page, names who does
what, and tells you which SOP to run in which order. Do the SOPs in number
order. Do not skip ahead.

## What we are building

A way for a non-engineer (procurement, GRC) to get a **first-pass vendor
security review** — **Approved**, **Approved with Risks**, or **Rejected** —
without leaving the tools the team already uses in Slack.

The review itself is a Claude skill, `vendor-review-basic`, that lives in this
repository. It reads a vendor's evidence (SOC 2, ISO 27001, pen test,
questionnaire, DPA) plus public sources and returns a decision with cited
findings.

This is a **pre-step** to the full vendor risk engine (`vrm-engine`). It does
**not** assign a vendor tier or produce a dollar risk figure.

## The stack — one job each

Three bots can live in the same Slack channel. They do not do the same job.
The most common mistake is sending the vendor packet to the wrong one.

| Tool | Its one job | Who uses it |
|---|---|---|
| **Linear** | The **ticket**: vendor, product, data/access, packet, owner, due date, status, findings. System of record. | Procurement, GRC, whoever owns the queue |
| **Claude Tag** (`@Claude` in Slack) | The **reviewer**: reads the packet, applies the skill, returns the decision, writes it back onto the Linear issue. | Anyone in the private review channel |
| **Cursor** (`@Cursor` in Slack) | **Repo work only**: change the skill, open a PR. Needs a Cursor seat and a git repo. | Engineers |
| **GitHub** | Stores the skill and its version history. Changes go through pull request. | Anyone who can merge |

Plain-English rule to give the intern:

- The **vendor packet** goes to **Linear** (the ticket) and is reviewed by
  **`@Claude`**.
- **`@Cursor`** is never the reviewer. It is for changing the skill's code.
- The **answer lives on the Linear issue**, not in the Slack thread.

## Why not just use Cursor or Linear to do the review

- **`@Cursor`** starts a Cloud Agent that clones a git repository and returns a
  pull request. A vendor packet is not a repo, and procurement usually has no
  Cursor seat. It is the wrong shape for grading a vendor.
- **`@Linear`** files and updates issues from a Slack thread. It does not read a
  SOC 2 and apply the decision logic. It is the queue, not the thinker.
- **`@Claude`** (Claude Tag) is the only one of the three that can read the
  documents and return a status — and, with the Linear connector on, write that
  status back onto the ticket.

## Order of operations

Run these in order. Each is its own SOP file in this folder.

1. **[SOP-01 — Linear](SOP-01-LINEAR.md)** — set up the ticket workflow:
   a team, the three statuses, labels, and the intake template. ~30 min.
2. **[SOP-02 — Claude Tag](SOP-02-CLAUDE-TAG.md)** — install the reviewer:
   push a private copy of this repo, register the plugin, build the access
   bundle, connect Linear, wire the private channel. ~45 min. **Owner role
   required.**
3. **[SOP-03 — Run a review](SOP-03-RUN-A-REVIEW.md)** — the day-to-day
   runbook the operators actually use. Hand this one to procurement.
4. **[SOP-04 — The skill](SOP-04-SKILL.md)** — what the skill does, how to
   change it safely, and the one bigger thing worth building next. For whoever
   maintains the logic.

If you only have time for one thing today, do **SOP-02 Block A** (clone and
validate) so the plugin is proven to work, then come back.

## Who does what

| SOP | Who runs it | Prerequisite |
|---|---|---|
| SOP-01 | Linear workspace admin | Linear admin access |
| SOP-02 | Claude org **Primary Owner or Owner** | Team/Enterprise plan; can make a private GitHub repo |
| SOP-03 | Procurement / GRC operators | Channel access (from SOP-02) |
| SOP-04 | Skill maintainer / engineer | Cursor or Claude Code, GitHub write |

## Non-negotiables (do not "improve" these away)

- **Private channel only.** SOC 2 and pen-test PDFs carry NDA terms. They go
  in a private Slack channel with controlled membership and a retention policy,
  never a broad or public channel.
- **The decision logic is deliberate.** One rejection trigger rejects
  (highest-severity wins), and `unknown` is never a pass. Do not soften these
  without a decision record in a PR. See SOP-04.
- **The Linear issue is the record.** The Slack thread is a convenience. If it
  is not on the issue, it did not happen.

## Glossary

- **Claude Tag** — Claude in Slack under the org's identity. Tagging `@Claude`
  in a channel bills the org; DMs bill the individual.
- **Access bundle** — a named set of credentials, repositories, and plugins
  that Claude uses in the channels the bundle is attached to.
- **Plugin** — a bundle of skills in Claude Code format. This repo is one
  plugin (`grc-vendor-review`) containing one skill (`vendor-review-basic`).
- **Skill** — the `SKILL.md` file that teaches Claude the review procedure.
- **Marketplace** — the catalog entry that makes the plugin installable. This
  repo is its own single-plugin marketplace named `grc-eng`.
