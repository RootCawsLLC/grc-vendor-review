# SOP — Slack vendor review (Claude Tag)

**Purpose.** Clone this plugin on a work laptop and attach it to Claude in Slack so
procurement can tag `@Claude`, drop a vendor packet, and get **Approved**,
**Approved with Risks**, or **Rejected** in the thread.

**This document is the setup.** The review procedure itself is
`skills/vendor-review-basic/SKILL.md`. Do not edit decision logic while you are
wiring Slack.

**Time.** 30–45 minutes if you already have Owner on the work Claude org and can
create a private GitHub repo there. Longer if GitHub App install or Slack pairing
needs someone else.

**Not the bot.** Cursor Slack (`@Cursor`) starts a coding agent against a git
repo. Linear Slack (`@Linear`) files issues. Neither runs this skill. Linear is
optional *after* a review, to ticket the human-review items.

---

## Prerequisites

- [ ] Work laptop has Git and Node 22+ (`node --version`)
- [ ] Work Claude org is **Team or Enterprise** (Claude Tag is not on Free/Pro)
- [ ] Your role in that org is **Primary Owner or Owner** — Admin cannot set this
      up. Docs name the Owner role and stop there; they do not require a separate
      seat SKU.
- [ ] You can create a **private or internal** GitHub repo in the work org.
      Claude Tag GitHub-sync refuses public repositories.
- [ ] You can create a **private Slack channel** with controlled membership and
      a retention policy. SOC 2 and pen-test PDFs will be uploaded there; confirm
      each vendor NDA permits that before the first live packet.

---

## Block A — Clone and verify on the work laptop

```bash
git clone https://github.com/RootCawsLLC/grc-vendor-review.git
cd grc-vendor-review
node scripts/validate.mjs
```

- [ ] `validate: ok — plugin grc-vendor-review@0.1.0, skills: vendor-review-basic`

**If Node is missing or older than 22:** install it before continuing. The
validator is the only local check; there is no `npm install`.

**If you cannot clone RootCawsLLC** (work GitHub cannot see it): copy the tree
another way (zip from this machine, USB, approved transfer) into a folder named
`grc-vendor-review` and run the same `node scripts/validate.mjs`.

---

## Block B — Put it in the work GitHub org (required for GitHub sync)

Claude Tag downloads the repo as one archive (512 MiB cap; this tree is tiny)
from **your** GitHub org, not from a laptop path.

```bash
# from inside grc-vendor-review, authenticated as the work GitHub user
gh repo create <work-org>/grc-vendor-review --private --source=. --remote=work --push
```

If `gh` is not how the work org creates repos, create an empty **private** repo
in the browser, add it as `work`, and push `main`.

- [ ] Repo is **private** (or internal). Not public.
- [ ] Default branch is `main`
- [ ] `marketplace.json` still has `"name": "grc-eng"` and
      `"source": "./"` — do not nest this under a `plugins/` directory
- [ ] Author in `.claude-plugin/plugin.json` is acceptable for the work org.
      Swap `author` to the work identity if policy requires it; the validator
      still passes.

Marketplace name `grc-eng` is what Claude Code users would type in
`/plugin install grc-vendor-review@grc-eng`. Renaming later means everyone
re-adds the marketplace. Decide now if the work org wants a different name.

---

## Block C — Pair Claude Tag with Slack

Owner only. Walkthrough: [Claude Tag setup overview](https://claude.com/docs/claude-tag/admins/setup-overview).

- [ ] Open `https://claude.ai/admin-settings` on the **work** Claude org
- [ ] Pair the work Slack workspace (install the Slack app, paste the pairing
      code)
- [ ] Set an organization spend limit **before** turning Claude Tag on. Channel
      tags bill the org; DMs bill the person's own Claude account — procurement
      should use the channel, not a DM
- [ ] Turn Claude Tag on

Member access: prefer "only members whose role allows it" (Enterprise) or
restrict to the vendor-review channel's membership. Do not leave it open to
the whole Slack workspace if SOC 2 PDFs will land there.

---

## Block D — Register this plugin

GitHub connector must already be on for the org.
[Skills repository](https://claude.com/docs/claude-tag/admins/skills-repo) ·
[Configure GitHub](https://claude.com/docs/claude-tag/admins/configure-github).

- [ ] `https://claude.ai/admin-settings/github` — Claude GitHub App installed
      and **linked** to the work GitHub org
- [ ] `https://claude.ai/admin-settings/plugins` → **Add plugins** →
      **Sync from GitHub** → select `<work-org>/grc-vendor-review`
- [ ] Leave **Sync automatically** on
- [ ] Create

**Zip fallback** (if GitHub sync is blocked on day one): Add plugins →
Upload a file → `.zip` of this repo, cap 200 MB. Layout must keep
`.claude-plugin/plugin.json` at the archive root and
`skills/vendor-review-basic/SKILL.md` where it is. GitHub sync is the path
you want: `main` is then the version the channel runs, and decision-logic
changes go through PR review.

---

## Block E — Access bundle and channel

A connection grants access; a plugin teaches the process. Attach this plugin
to a **dedicated** bundle, not the org-wide general bundle.
[Attach plugins](https://claude.com/docs/claude-tag/admins/add-connections).

- [ ] Create an Access bundle named for this use (for example `vendor-review`)
- [ ] Plugins tab: toggle **grc-vendor-review** on (listed plugins stay off
      until toggled)
- [ ] Repositories tab: grant `<work-org>/grc-vendor-review` if you want Claude
      able to open PRs against the skill later. Not required to *run* a review
- [ ] Create Slack channel `#vendor-review` (or equivalent): **private**,
      named members only, retention policy set
- [ ] `/invite @Claude`
- [ ] Attach the `vendor-review` bundle to that channel (private-channel
      scope). Do not attach it to every public channel

Optional bundle Instructions, one line, so it does not wait to be asked:

```
When a vendor packet is attached or someone asks for a vendor review, run the vendor-review-basic skill and reply with the report template. Do not assign a vendor tier or quantify loss.
```

---

## Block F — Smoke test

Use a **synthetic** packet, not a real vendor NDA document, until the channel
membership and retention are right.

In `#vendor-review`:

```
@Claude first-pass vendor review for ExampleCo, product ExampleCRM.
They will hold customer personal data and have API read access to our systems.
Packet attached.
```

Attach a fixture SOC 2 / questionnaire (synthetic). You should get a report
with Status, Vendor summary, Evidence reviewed, Findings, and — unless the
status is clean Approved — Items for Human Review.

- [ ] Status is one of Approved / Approved with Risks / Rejected
- [ ] Findings cite the attached file (or mark unreachable public sources
      Not Verified)
- [ ] No mention of auditors or the review process in the report body
- [ ] Gated trust-center URLs land as Not Verified, not as findings

If Claude ignores the skill: confirm the plugin is toggled **on** for this
bundle, the bundle is on this channel, and you tagged `@Claude` in the
channel (not a DM). Ask `@Claude what plugins can you use in this channel?`

---

## Day-to-day

```
@Claude first-pass vendor review for <Vendor>, product <name>.
They will hold <data types> and have <access>. Packet attached.
```

Anyone in the channel can steer the same thread. Usage of channel tags bills
the org.

After a review, optionally:

```
@Linear file the Items for Human Review from this thread and assign the vendor-review owner
```

That is ticketing, not the assessment.

---

## Changing the skill later

Edit `skills/vendor-review-basic/SKILL.md` on a branch, run
`node scripts/validate.mjs`, PR, merge to `main`. GitHub sync updates the
org catalog; the **next** thread uses the new text. Decision logic (Step 5)
is max-rule, `unknown` is never a pass, and the no-evidence threshold is the
knob procurement will argue about — do not soften those without a decision
record in the PR.

---

## If this fails

| Symptom | Likely cause |
|---|---|
| Plugins page will not list the repo | Repo is public, GitHub App not linked, or archive > 512 MiB |
| Plugin listed but Claude does not use it | Toggled off on the bundle, or bundle not attached to this channel |
| `@Claude` silent in the channel | Claude Tag off, spend limit hit, `@Claude` not invited, or guest-channel restrict |
| DMs work, channel does not | DMs use the person's Claude account; channels use org identity and the bundle |
| Real SOC 2 in a busy channel | Wrong channel. Move to the private one before the next packet |
