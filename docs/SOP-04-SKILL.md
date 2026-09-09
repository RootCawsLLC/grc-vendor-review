# SOP 04 — The skill: what it does, how to change it, what to build next

**For.** Whoever maintains the review logic (an engineer, or a GRC person
comfortable with a pull request). Operators do not need this file.

The skill is `skills/vendor-review-basic/SKILL.md`. It is the whole product —
everything else in this repo exists to package, validate, and ship that one
file.

---

## What the skill is

A Claude skill: a Markdown file with YAML frontmatter (`name`, `description`)
and a body of instructions. Claude loads it when the `description` matches what
someone asked for. There is no code path and no model call to configure — the
"logic" is the prose in the body, and Claude follows it.

The body is a six-step procedure plus a conditional seventh:

1. **Engagement** — classify the deal as high- or low-exposure.
2. **Evidence inventory** — list every artifact; mark unreadable ones
   *Not Verified*.
3. **Read each artifact** — extract cited facts from SOC 2 / ISO / pen test /
   questionnaire / DPA.
4. **Public sources** — trust center, security.txt, status page, CSA STAR,
   breach reporting.
5. **Decision** — apply the triggers; the highest-severity one that fires wins.
6. **Report** — the fixed template, with **Items for Human Review** only on the
   two non-clean statuses.
7. **Post to the tracker** — *only if a tracker connector (Linear) is present*:
   comment the report on the issue, set the state, open a sub-issue per
   human-review item, never close the issue.

---

## The decision logic — and the two rules not to touch

Everything the reviewer decides is in **Step 5**. Three outcomes, evaluated by
checking every trigger and taking the worst one that fired.

Two rules are deliberate. Changing them changes what the tool *is*. Do not
soften either without a decision record in the pull request that does it:

- **Highest-severity trigger wins (max-rule, not averaged).** One rejection
  trigger rejects. A strong SOC 2 does not average out an open Critical pen-test
  finding. This mirrors the inherent-tiering rule in the `vrm-engine` guide.
- **`unknown` is never a pass.** A missing document, an unanswered
  questionnaire item, or an unreachable trust center is a gap — never a
  satisfied control. This is why thin packets land in *Approved with Risks*
  rather than *Approved*.

### The one knob that is meant to be tuned

The **no-evidence** case is split by exposure and is the setting most likely to
need adjustment for how your procurement team actually behaves:

- No usable evidence **+ high exposure (or unknown exposure)** → **Rejected**
  ("insufficient evidence does not support an approval").
- No usable evidence **+ stated low exposure** → **Approved with Risks** with
  the gap named.

If procurement finds the Rejected threshold too aggressive (or not aggressive
enough), this is the line to move — in a PR, with a note on why.

### Known limits (state them; do not "fix" them by guessing)

- Claude **cannot read a gated trust center.** Anything behind a login is
  *Not Verified*, not a finding and not a pass.
- SOC 2 **scope-vs-purchase mismatch requires the report to name the product.**
  Many reports describe a platform without product names; silence is not a
  mismatch.

---

## How to change the skill safely

Never edit the live skill in Slack channel memory. Changes go through GitHub so
`main` is always the version the channel runs, and every change is reviewable.

1. Clone the **work** repo (the private copy from SOP-02 Block B) and branch:

   ```bash
   git clone https://github.com/<work-org>/grc-vendor-review.git
   cd grc-vendor-review
   git checkout -b tweak-no-evidence-threshold
   ```

2. Edit `skills/vendor-review-basic/SKILL.md`. If you are using **Cursor** or
   **Claude Code**, this is exactly the kind of edit `@Cursor` is for — point it
   at this repo, not at a vendor packet.

3. Validate locally — this is not optional, CI runs the same check:

   ```bash
   node scripts/validate.mjs
   ```

4. Open a PR. Describe *what decision changed and why*. If you touched Step 5's
   two hard rules or the no-evidence threshold, say so explicitly — that is the
   decision record.

5. Merge to `main`. GitHub sync updates the org catalog; the **next** Slack
   thread uses the new text. In-flight threads keep the version they started
   with.

### What the validator checks

`scripts/validate.mjs` (no dependencies) fails the build if:

- Either manifest is missing a required field or is not valid JSON
- The plugin **name or version disagrees** between `plugin.json` and
  `marketplace.json`
- A `skills/<name>/SKILL.md` is missing, or its frontmatter `name` does not
  match its directory
- The `description` exceeds the **1536-character** listing budget (it loads on
  every turn, so it is not free)
- Any `TODO` / placeholder text is left in a `SKILL.md`

Bump `version` in **both** manifests together when you cut a release; the
validator enforces that they match.

---

## Consider: the skill (and agent) worth building next

`vendor-review-basic` is the thinking skill, and it is surface-agnostic — it
runs in Claude Tag today, and its Step 7 will write to Linear when the connector
is present. Two extensions are worth planning, in priority order:

### 1. A Linear-native assignable reviewer (the real upgrade)

Today the flow is: a human tags `@Claude` in Slack with the issue ID. The
cleaner GRC flow is: **assign the Linear issue to the reviewer, and it runs
itself.** Linear supports this, but it is a build, not a toggle:

- An OAuth app installed with **`actor=app`** and the **`app:assignable`** /
  **`app:mentionable`** scopes, so the agent is a real assignee/delegate.
- Subscription to **Agent Session** webhooks, so "issue delegated" triggers a
  run.
- A small **hosted runner** that receives the webhook, pulls the issue's
  attachments, runs the `vendor-review-basic` procedure, and comments the report
  back with the state change.

The review *logic* does not change — it is still this skill. What you are
building is the front door: assignment instead of an @-mention. Reference:
[Linear agents](https://linear.app/developers/agents),
[OAuth actor authorization](https://linear.app/developers/oauth-actor-authorization).

### 2. A companion `vendor-review-deep` skill (later, not now)

When `vrm-engine` reaches the point of tiering and FAIR scoring, a second skill
can hand off from this one: `vendor-review-basic` gives the go/no-go, and the
deep skill runs the tier-scoped questionnaire and loss model. Keep them
separate — this skill's whole value is that it is fast and does **not** try to
be the full assessment. Do not grow Step 5 into a scoring engine.

### What not to build

- Do not put a weighted-average score into Step 5. Max-rule is the design.
- Do not let the skill mark a control "met" from a document heading; it must
  cite the statement.
- Do not add SIG / HECVAT / CAIQ / SCF question text to the skill — original
  wording only, consistent with the `vrm-engine` licensing rule.
