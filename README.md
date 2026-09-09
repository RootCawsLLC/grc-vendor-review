# grc-vendor-review

A Claude plugin containing one skill: `vendor-review-basic`, a first-pass vendor security review
that returns **Approved**, **Approved with Risks**, or **Rejected** from whatever evidence is
submitted (SOC 2, ISO 27001, penetration test reports, security questionnaires, DPAs) plus public
sources, with a short vendor summary and the findings behind the call.

This is a pre-step to the full vendor risk assessment engine. It does not assign a vendor tier,
quantify loss exposure, or score controls individually.

## Repository layout

```
.claude-plugin/
  plugin.json          plugin manifest
  marketplace.json     marketplace manifest — this repo is its own single-plugin marketplace
skills/
  vendor-review-basic/
    SKILL.md           the review procedure and report template
scripts/
  validate.mjs         manifest + skill validation, no dependencies
.github/workflows/
  validate.yml         runs the validator on push and pull request
```

## Installing

**Slack (the path procurement uses):** follow **[docs/SOP-SLACK-SETUP.md](docs/SOP-SLACK-SETUP.md)** on the work laptop — clone, push a private copy to the work GitHub org, register it with Claude Tag, attach the plugin to a private-channel access bundle. Cursor Slack and Linear Slack are not this bot; the SOP says why.

### Claude in Slack (Claude Tag)

Requires a Team or Enterprise plan and the Owner role. The SOP is the checklist; the three-line version is:

1. In admin settings, add this repository as a plugin source (GitHub sync) or upload it as a `.zip`.
2. Attach the `grc-vendor-review` plugin to the access bundle used by the channels that should have it.
3. In a channel with that bundle, tag `@Claude` with the vendor's name and attach the evidence.

GitHub sync re-pulls on change, so `main` is the version the team is running.

### Claude Code

```
/plugin marketplace add <owner>/<repo>
/plugin install grc-vendor-review@grc-eng
```

For fleet-wide installation without per-user commands, add the marketplace to
`extraKnownMarketplaces` in managed settings.

### Cursor

Cursor reads `.claude/skills/` for compatibility. Symlink or copy
`skills/vendor-review-basic/` to `.claude/skills/vendor-review-basic/` in the target repository, or
publish it to the team marketplace.

## Validating changes

```
node scripts/validate.mjs
```

Checks that both manifests parse and carry their required fields, that the plugin name and version
agree across them, that each `skills/<name>/SKILL.md` exists with frontmatter whose `name` matches
its directory, that the description stays inside the 1536-character listing budget, and that no
unresolved `TODO` / placeholder text ships. Exits non-zero with the full list of failures.

## Changing the decision logic

The three statuses and their triggers are in Step 5 of `skills/vendor-review-basic/SKILL.md`. Two
rules there are deliberate and should not be softened without a decision record:

- **Highest-severity trigger wins.** One rejection trigger rejects. Good and bad evidence are not
  averaged.
- **`unknown` is never a pass.** A missing document, an unanswered question, or an unreachable trust
  center is a gap, not a satisfied control.

The one threshold likely to need tuning per organization is the no-evidence case: currently, no
usable evidence plus confidential/regulated data or production access is a Rejected, while the same
gap on a low-exposure engagement is Approved with Risks.

## Handling of vendor evidence

Audit reports and penetration test reports frequently carry NDA terms restricting distribution and
storage. Running this skill in Slack means those documents are uploaded to a Slack channel. Use a
private channel with controlled membership and a retention policy, and confirm the terms of each
vendor's NDA permit it.
