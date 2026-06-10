---
id: agent-hooks
title: Agent Hooks
sidebar_label: Agent Hooks
sidebar_position: 4
---

# Agent Hooks

<div className="page-intro">
  <div className="page-intro__icon">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  </div>
  <div>
    <p className="page-intro__desc">
      Hooks are event-driven triggers that automatically invoke the Kiro agent when something happens in your project —
      file saves, git commits, spec completions, and more. Define the condition once; Kiro acts on it every time.
    </p>
    <div className="page-intro__tags">
      <span className="pi-tag">.kiro/hooks/</span>
      <span className="pi-tag">file_save</span>
      <span className="pi-tag">git_commit</span>
      <span className="pi-tag">spec_complete</span>
      <span className="pi-tag">manual</span>
    </div>
  </div>
</div>

## The Problem Hooks Solve

Every team has checks that should happen automatically but don't — because they depend on a developer remembering to run them. Someone saves a Terraform file with an open security group. No one notices until CI runs 20 minutes later, or until a reviewer catches it on the PR, or worst of all, until the resource is already deployed.

**Hooks close that gap.** You write a condition once — "when any `.tf` file is saved" — and attach a Kiro agent instruction. From that point on, the check happens automatically, every time, without anyone having to remember.

<div className="spec-why">
  <div className="spec-why__col spec-why__col--bad">
    <div className="spec-why__label">Without Hooks</div>
    <ul>
      <li>Developer saves Terraform, assumes it's fine</li>
      <li>Pushes to git, CI picks it up 15–20 minutes later</li>
      <li>Checkov flags missing tags and an open security group</li>
      <li>Developer context-switches back to fix the issues</li>
      <li>Repeat for every teammate, on every push</li>
    </ul>
  </div>
  <div className="spec-why__col spec-why__col--good">
    <div className="spec-why__label">With Hooks</div>
    <ul>
      <li>Developer saves Terraform</li>
      <li>Kiro immediately reviews the file in the background</li>
      <li>Findings appear as inline comments in the editor</li>
      <li>Issues caught in seconds, not minutes</li>
      <li>CI becomes a safety net, not the first line of defence</li>
    </ul>
  </div>
</div>

---

## How Hooks Work

A hook is a YAML file in `.kiro/hooks/`. It has three parts: a **trigger** (when to fire), a **glob or path filter** (which files to watch), and an **instruction** (what to tell the agent).

```yaml
# .kiro/hooks/<hook-name>.yaml
name: Hook Display Name
description: What this hook does
trigger:
  type: <event-type>
  glob: "path/pattern/**"   # optional: limit which files trigger this
instruction: |
  Natural language instruction for the Kiro agent.
  Reference event context with {{variables}} like {{file_path}} or {{timestamp}}.
```

### Trigger types

<div className="trigger-grid">
  <div className="trigger-item">
    <span className="trigger-item__badge">file_save</span>
    <p className="trigger-item__desc">A file matching a glob pattern is saved</p>
  </div>
  <div className="trigger-item">
    <span className="trigger-item__badge">file_create</span>
    <p className="trigger-item__desc">A new file is created in the project</p>
  </div>
  <div className="trigger-item">
    <span className="trigger-item__badge">spec_complete</span>
    <p className="trigger-item__desc">A Kiro spec finishes running all its tasks</p>
  </div>
  <div className="trigger-item">
    <span className="trigger-item__badge">git_commit</span>
    <p className="trigger-item__desc">A git commit is made (pre or post-commit)</p>
  </div>
  <div className="trigger-item">
    <span className="trigger-item__badge">manual</span>
    <p className="trigger-item__desc">You invoke the hook from the command palette</p>
  </div>
</div>

---

## Demo: Validate Terraform on Every Save

This is a complete walkthrough of a hook used daily by platform and SRE teams — a `file_save` hook that reviews every Terraform file the moment a developer saves it.

### The scenario

Your team has Terraform spread across dozens of modules. The rules are well-known: every resource needs standard tags, no security groups open to `0.0.0.0/0`, no hardcoded ARNs, encrypted storage. But these rules live in a wiki. Developers forget. CI catches it — eventually.

The hook below makes Kiro the reviewer that never forgets.

### Step 1 — Create the hook file

Create `.kiro/hooks/validate-terraform.yaml` in your project:

```yaml
# .kiro/hooks/validate-terraform.yaml
name: Validate Terraform on Save
description: Reviews every saved .tf file for security, compliance, and tagging issues
trigger:
  type: file_save
  glob: "**/*.tf"
instruction: |
  The Terraform file {{file_path}} was just saved by the developer.

  Review it and report any of the following issues as inline code comments
  placed directly above the offending line — do not modify the file itself:

  1. Resources missing required tags: env, team, cost-center, owner
  2. Security groups with ingress rules open to 0.0.0.0/0 on any port other than 443 or 80
  3. Hardcoded AWS account IDs or ARNs (these must be variables or data sources)
  4. S3 buckets without versioning or server-side encryption enabled
  5. IAM policies using wildcard actions ("*")

  Format each finding as:
    # ⚠️ HOOK: <issue description> — <one-line fix hint>

  If no issues are found, append a single line comment at the top of the file:
    # ✓ Hook: no issues found ({{timestamp}})
```

### Step 2 — The hook appears in Kiro's panel

Once the file is saved to `.kiro/hooks/`, Kiro picks it up automatically — no restart needed. Open the Kiro hooks panel to confirm it is active:

![Kiro hooks panel showing the Validate Terraform hook registered and ready — the trigger type, glob pattern, and last run status are visible](/img/tutorial/hooks.png)

The panel shows every hook in your project, its trigger type, and whether it last ran successfully. This is where you enable, disable, or manually trigger a hook during development.

### Step 3 — A developer saves a Terraform file

Here is the file the developer just saved (`terraform/iam.tf`):

```hcl
resource "aws_iam_role_policy" "lambda_policy" {
  name = "incident-bot-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "*"
      Resource = "arn:aws:ssm:us-east-1:123456789012:parameter/incident-bot/*"
    }]
  })
}
```

Two problems are immediately visible to an experienced reviewer — but a developer under time pressure might not notice.

### Step 4 — Kiro's inline findings

Within seconds of the save, Kiro adds inline comments to the file:

```hcl
# ⚠️ HOOK: IAM policy uses wildcard Action "*" — restrict to ssm:GetParameter only
# ⚠️ HOOK: Hardcoded AWS account ID in ARN — replace with data.aws_caller_identity.current.account_id
resource "aws_iam_role_policy" "lambda_policy" {
  name = "incident-bot-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "*"
      Resource = "arn:aws:ssm:us-east-1:123456789012:parameter/incident-bot/*"
    }]
  })
}
```

The developer fixes both issues without leaving the editor. The corrected file:

```hcl
# ✓ Hook: no issues found (2026-06-10T09:14:22Z)
resource "aws_iam_role_policy" "lambda_policy" {
  name = "incident-bot-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameter"]
      Resource = "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/incident-bot/*"
    }]
  })
}
```

No context switch, no CI wait, no PR comment thread. The issue was caught, explained, and fixed in under a minute.

---

## Starting Safely: Use `manual` First

Before setting any hook to fire automatically, develop it as a `manual` hook. Change the trigger to `type: manual`, run it from the command palette a few times, and verify the output is correct. Once you are confident in the instruction, switch it back to `file_save` or `git_commit`.

This prevents a badly-written instruction from firing on every save before you have tested it.

---

## Three Rules for Reliable Hooks

**Write to a different path than you read from.** A hook triggered by saving `src/*.py` must not write back to `src/*.py` — that creates a save loop. Write findings to a log file, a separate review directory, or inline comments only.

**Be specific with globs.** `file_save` on `**/*` fires on every keystroke autosave. Target exactly what you mean: `terraform/**/*.tf`, `alerts/*.yaml`, `src/**/*.py`.

**Keep the instruction concrete.** Name the exact checks, the exact output format, and the exact file to write results to. Vague instructions produce inconsistent output when the hook fires unattended.
