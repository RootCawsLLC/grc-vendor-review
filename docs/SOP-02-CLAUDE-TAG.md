# SOP 02 — Claude Tag: install the reviewer

**Goal.** Put the `grc-vendor-review` plugin into Claude in Slack so anyone in a
private channel can tag `@Claude`, attach a vendor packet, and get a decision —
written back onto the Linear issue from SOP-01.

**Who runs this.** The Claude organization's **Primary Owner or Owner**. The
Admin role cannot set up Claude Tag. The docs name the Owner role and do not
require a specific seat type beyond it.

**Time.** ~45 minutes if you already have Owner and can create a private GitHub
repo. Longer if the GitHub App install or Slack pairing needs someone else.

**Do SOP-01 first.** This SOP connects the reviewer to the Linear queue that
SOP-01 creates.

---

## Prerequisites

- [ ] Work laptop has Git and Node 22+ (`node --version` prints v22 or higher)
- [ ] Work Claude org is **Team or Enterprise** (Claude Tag is not on Free/Pro)
- [ ] You are **Primary Owner or Owner** in that Claude org
- [ ] You can create a **private or internal** GitHub repo in the work org.
      Claude Tag GitHub-sync **refuses public repositories.**
- [ ] You can create a **private Slack channel** with controlled membership and
      a retention policy

---

## Block A — Clone and verify on the work laptop

```bash
git clone https://github.com/RootCawsLLC/grc-vendor-review.git
cd grc-vendor-review
node scripts/validate.mjs
```

- [ ] Output ends with:
      `validate: ok — plugin grc-vendor-review@0.1.0, skills: vendor-review-basic`

**If Node is missing or older than 22:** install Node 22+ first. There is no
`npm install` for this repo; the validator is plain Node with no dependencies.

**If you cannot clone from RootCawsLLC** (the work laptop's GitHub cannot see
it): get the tree in another approved way (zip, USB), unzip into a folder named
`grc-vendor-review`, and run `node scripts/validate.mjs` there.

---

## Block B — Put a private copy in the work GitHub org

Claude Tag downloads the plugin as one archive (512 MiB cap; this tree is tiny)
from **your** GitHub org — not from a laptop path. So it must live in a private
repo the work org controls.

```bash
# from inside grc-vendor-review, authenticated as the work GitHub user
gh repo create <work-org>/grc-vendor-review --private --source=. --remote=work --push
```

If `gh` is not how your org creates repos: create an empty **private** repo in
the browser, then:

```bash
git remote add work https://github.com/<work-org>/grc-vendor-review.git
git push -u work main
```

Check:

- [ ] Repo is **private** or **internal** — not public
- [ ] Default branch is **main**
- [ ] `.claude-plugin/marketplace.json` still has `"name": "grc-eng"` and
      `"source": "./"` — do not nest the plugin under a `plugins/` folder
- [ ] Author in `.claude-plugin/plugin.json` is acceptable for the work org
      (swap to a work identity if policy requires; the validator still passes)

Marketplace name `grc-eng` is what appears in
`/plugin install grc-vendor-review@grc-eng`. Renaming it later forces everyone
to re-add the marketplace, so decide now if the work org wants a different name.

---

## Block C — Pair Claude Tag with Slack

Owner only. Full walkthrough:
[Claude Tag setup overview](https://claude.com/docs/claude-tag/admins/setup-overview).

- [ ] Open `https://claude.ai/admin-settings` on the **work** Claude org
- [ ] Pair the work Slack workspace: install the Slack app, paste the pairing
      code Slack gives you back into the admin page
- [ ] Set an **organization spend limit before turning Claude Tag on**. Channel
      tags bill the org; DMs bill the individual's own Claude account —
      procurement should always use the channel
- [ ] Turn Claude Tag on
- [ ] Set **Member Access**. Prefer "only members whose role allows it"
      (Enterprise) or otherwise rely on the private channel's membership. Do not
      leave it open to the whole workspace if SOC 2 PDFs will land there

---

## Block D — Link GitHub and register the plugin

GitHub is managed through the Claude GitHub App (same one Claude Code uses).
[Configure GitHub](https://claude.com/docs/claude-tag/admins/configure-github) ·
[Skills repository](https://claude.com/docs/claude-tag/admins/skills-repo).

- [ ] Open `https://claude.ai/admin-settings/github`
- [ ] Confirm the Claude GitHub App is installed **and linked** to the work
      GitHub org (Link it if it shows under "Unlinked accounts")
- [ ] Open `https://claude.ai/admin-settings/plugins`
- [ ] Click **Add plugins → Sync from GitHub**
- [ ] Select `<work-org>/grc-vendor-review`
- [ ] Leave **Sync automatically** on
- [ ] Click **Create**

You should see the `grc-eng` marketplace and the `grc-vendor-review` plugin in
your org's plugin catalog (available, not yet active).

**Zip fallback** if GitHub sync is blocked on day one: Add plugins → **Upload a
file** → a `.zip` of this repo (200 MB cap). Keep `.claude-plugin/plugin.json`
at the archive root and `skills/vendor-review-basic/SKILL.md` where it is.
Prefer GitHub sync: with it, `main` is the version the channel runs and skill
changes go through PR review.

---

## Block E — Access bundle, Linear connector, and channel

A connection grants access; a plugin teaches the process. Attach both to a
**dedicated** bundle, not the org-wide general one.
[Attach plugins](https://claude.com/docs/claude-tag/admins/add-connections).

- [ ] Create an Access bundle named `vendor-review`
- [ ] **Plugins tab:** toggle **grc-vendor-review** on (listed plugins are off
      until toggled)
- [ ] **Credentials tab:** add the **Linear** connector so Claude can comment on
      and set the status of the issue. Use a dedicated Linear service account
      scoped to the **Vendor Review** team, not a person's Linear login
- [ ] **Repositories tab:** grant `<work-org>/grc-vendor-review` if you want
      Claude able to open PRs against the skill later. Not required to run a
      review
- [ ] Create the Slack channel (for example `#vendor-review`): **private**,
      named members only, retention policy set
- [ ] `/invite @Claude` in that channel
- [ ] `/invite @Linear` in that channel (from SOP-01 Step 5)
- [ ] Attach the `vendor-review` bundle to that channel's scope. Do **not**
      attach it to every public channel

Set the bundle's **Instructions** to this, editing the state names to match
what you created in SOP-01:

```
When a vendor packet is attached or someone asks for a vendor review, run the
vendor-review-basic skill and reply with the report template. Do not assign a
vendor tier or quantify loss.

If a Linear issue is referenced, post the full report as a comment on that issue
and set its state: Approved -> "Approved"; Approved with Risks -> "Approved with
Risks"; Rejected -> "Rejected". Create one Linear sub-issue per line under Items
for Human Review and assign it to the review owner. Never close the issue; a
human closes it.
```

---

## Block F — Smoke test with a SYNTHETIC packet

Do not use a real vendor NDA document until membership and retention are
confirmed correct.

1. In Linear, file a test issue from the **Vendor review** template
   (or `@Linear file a vendor review for ExampleCo` in the channel). Note the
   ID, e.g. `VR-1`.
2. In `#vendor-review`, in a thread on that request:

```
@Claude first-pass vendor review for ExampleCo, product ExampleCRM, tracked in VR-1.
They will hold customer personal data and have API read access to our systems.
Packet attached.
```

3. Attach a **synthetic** SOC 2 / questionnaire.

Check the reply and the issue:

- [ ] Status is one of Approved / Approved with Risks / Rejected
- [ ] Findings cite the attached file (or mark unreachable sources Not Verified)
- [ ] No mention of auditors or the review process in the report body
- [ ] Gated trust-center URLs land as Not Verified, not as findings
- [ ] The report appears **as a comment on VR-1** and the issue **state changed**
- [ ] Human-review items became sub-issues (Approved with Risks / Rejected)
- [ ] The issue is **not** closed

---

## If this fails

| Symptom | Likely cause |
|---|---|
| Plugins page will not list the repo | Repo is public, GitHub App not linked, or archive > 512 MiB |
| Plugin listed but Claude does not use it | Toggled off on the bundle, or the bundle is not attached to this channel |
| `@Claude` silent in the channel | Claude Tag off, spend limit hit, `@Claude` not invited, or a guest-channel restriction |
| DMs work but the channel does not | DMs use the person's own Claude account; channels use the org identity and this bundle |
| Report posted in thread but not on the issue | Linear connector missing from the bundle, or the issue ID was not in the prompt |
| Wrong state set | Bundle Instructions state names do not match SOP-01's states |
| Real SOC 2 in a busy channel | Wrong channel — move to the private one before the next packet |

---

## Done when

- [ ] The plugin is synced from the private work repo and toggled on for the
      `vendor-review` bundle
- [ ] The bundle carries the Linear connector and is attached to the private
      channel
- [ ] A synthetic smoke test produced a decision **on the Linear issue**

Next: hand **[SOP-03 — Run a review](SOP-03-RUN-A-REVIEW.md)** to the operators.
