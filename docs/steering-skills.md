---
id: steering-skills
title: Agent Steering & Skills
sidebar_label: Steering & Skills
sidebar_position: 5
---

# Agent Steering &amp; Skills

<div className="page-intro">
  <div className="page-intro__icon">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      <line x1="12" y1="2" x2="12" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="15" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="15" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </div>
  <div>
    <p className="page-intro__desc">
      <strong>Steering</strong> gives the agent persistent team context applied to every action.
      <strong> Skills</strong> are reusable slash-command workflows your team invokes on demand.
      Together they define <em>how</em> Kiro thinks and what shortcuts it knows.
    </p>
    <div className="page-intro__tags">
      <span className="pi-tag">.kiro/steering/</span>
      <span className="pi-tag">.kiro/skills/</span>
      <span className="pi-tag">/iac-review</span>
    </div>
  </div>
</div>

---

## Agent Steering

### The Problem Steering Solves

Every time you start a new Kiro session or run a new spec, the agent starts without any knowledge of your team's conventions. Without steering, you either repeat yourself constantly — "use Terraform AWS provider ~> 5.0, tag every resource with env/team/cost-center, never use wildcard IAM actions" — or you get code that violates those rules and has to be corrected in every diff review.

**Steering files solve this by giving the agent persistent memory.** You write your conventions once, commit them to the repo, and every agent action — specs, chat, hooks, skills — reads those files automatically before doing anything.

<div className="spec-why">
  <div className="spec-why__col spec-why__col--bad">
    <div className="spec-why__label">Without Steering</div>
    <ul>
      <li>Agent generates IAM policies with <code>Action: "*"</code> — your policy forbids it</li>
      <li>Lambda is named <code>incident-bot-dev</code> — your convention is <code>dev-sre-incident-bot-lambda</code></li>
      <li>Terraform provider version is unpinned</li>
      <li>Required tags (env, team, cost-center) are missing from every resource</li>
      <li>You correct the same issues in every spec review, every time</li>
    </ul>
  </div>
  <div className="spec-why__col spec-why__col--good">
    <div className="spec-why__label">With Steering</div>
    <ul>
      <li>Agent knows your IAM least-privilege rule — never generates wildcards</li>
      <li>Every resource name follows your <code>{'{env}-{team}-{service}-{type}'}</code> pattern</li>
      <li>Terraform provider is pinned to <code>~&gt; 5.0</code> automatically</li>
      <li>All resources include required tags from <code>local.common_tags</code></li>
      <li>Conventions are enforced silently — you review content, not style</li>
    </ul>
  </div>
</div>

### How Steering Files Work

Steering files are plain Markdown in `.kiro/steering/`. Write them like a briefing document for a new team member — the agent reads every file in that directory before taking any action.

```
.kiro/
  steering/
    infrastructure-standards.md   ← Terraform conventions, tagging rules, regions
    coding-standards.md            ← Python version, formatter, test framework
    incident-conventions.md        ← Severity levels, runbook format, escalation
```

A steering file has no required structure — it is just Markdown. The more specific and concrete it is, the more precisely the agent follows it.

### Demo: Infrastructure Standards

This is a steering file used by an SRE team that manages AWS infrastructure with Terraform. Once committed, every spec and every agent chat session in this repo applies these rules automatically — without anyone having to repeat them.

**Create** `.kiro/steering/infrastructure-standards.md`:

```markdown
# Infrastructure Standards

## AWS
- Primary region: us-east-1 — DR region: us-west-2
- All resources must be tagged: env, team, cost-center, owner
- IAM policies must follow least privilege — never use wildcard actions (`"*"`)
- All S3 buckets require versioning and AES-256 server-side encryption

## Terraform
- AWS provider version: `~> 5.0` — required Terraform version: `>= 1.6`
- Remote state: S3 backend with DynamoDB locking (see `backend.tf`)
- Module structure: `main.tf`, `variables.tf`, `outputs.tf`, `README.md` — no exceptions
- Tag all resources using `local.common_tags` from `locals.tf`

## Naming Conventions
- Resources: `{env}-{team}-{service}-{resource-type}`
  - ✓ prod-sre-incident-bot-lambda
  - ✗ incident-bot (missing env and team)
- S3 buckets: `{org}-{env}-{purpose}` (e.g., acme-prod-terraform-state)
- IAM roles: `{service}-{env}-role` (e.g., incident-bot-prod-role)
```

### What Changes in Practice

Here is the same spec task — "Create the Lambda IAM role" — run with and without this steering file in place.

**Without steering**, Kiro generates:

```hcl
resource "aws_iam_role" "lambda" {
  name = "lambda-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
```

Three violations: wrong name format, `AdministratorAccess` (wildcard), no tags.

**With the steering file committed**, the same task produces:

```hcl
locals {
  common_tags = {
    env         = var.environment
    team        = "sre"
    cost-center = "platform"
    owner       = "sre-team@company.com"
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "${var.environment}-sre-incident-bot-lambda-role"
  tags = local.common_tags

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "ssm_access" {
  name = "${var.environment}-sre-incident-bot-ssm-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameter"]
      Resource = "arn:aws:ssm:*:*:parameter/incident-bot/*"
    }]
  })
}
```

Correct name, least-privilege policy, all tags present. The steering file turned three review rejections into zero.

### Kiro with Steering Configured

Here is what the Kiro quick guide looks like once steering files are in place — the agent surfaces your team's configured context so you can see at a glance what conventions it knows:

![Kiro quick guide showing configured steering context — the agent displays active steering files and their purpose before any action](/img/tutorial/quick-guide.png)

---

## Skills

### The Problem Skills Solve

Some tasks follow a fixed pattern that every developer on the team needs but no one wants to re-describe from scratch every time. "Review this Terraform for security issues." "Draft a postmortem from these notes." "Give me a triage plan for this alert." These are always the same structure — only the input changes.

**Skills package that structure as a slash command.** You define the instruction once in a YAML file, give it a name, and anyone on the team types `/skill-name` in the Kiro chat panel to run it instantly on the current file or context.

<div className="spec-why">
  <div className="spec-why__col spec-why__col--bad">
    <div className="spec-why__label">Without Skills</div>
    <ul>
      <li>Developer writes a long prompt every time: "review this Terraform for security groups open to 0.0.0.0/0, missing tags, wildcard IAM..."</li>
      <li>Different developers prompt differently — inconsistent output</li>
      <li>No one remembers the exact checklist the team agreed on</li>
      <li>New team members don't know which prompts to use</li>
    </ul>
  </div>
  <div className="spec-why__col spec-why__col--good">
    <div className="spec-why__label">With Skills</div>
    <ul>
      <li>Developer types <code>/iac-review</code> — that's it</li>
      <li>Every developer gets the same structured, prioritized report</li>
      <li>The checklist is version-controlled and kept up to date by the team</li>
      <li>New team members onboard to team workflows in minutes</li>
    </ul>
  </div>
</div>

### How Skills Work

Skills are YAML files in `.kiro/skills/`. Each file defines the name (which becomes the slash command) and the full instruction the agent follows when invoked.

```yaml
# .kiro/skills/<skill-name>.yaml
name: skill-name
description: One-line description shown in the skill picker
instruction: |
  Detailed instructions for the agent.
  The agent runs this when /skill-name is invoked.
  Write it as precisely as a spec instruction — the more specific, the better.
```

Invoke any skill by typing `/<skill-name>` in the Kiro chat panel. The skill picker autocompletes from your `.kiro/skills/` directory.

### Demo: `/iac-review`

This skill gives every developer on the team a consistent, prioritized Infrastructure-as-Code review on demand — the same checks a senior engineer would run, available to everyone with two keystrokes.

**Create** `.kiro/skills/iac-review.yaml`:

```yaml
# .kiro/skills/iac-review.yaml
name: iac-review
description: Security, compliance, and best-practice review of the open IaC file
instruction: |
  Review the currently open file as Infrastructure as Code
  (Terraform, CloudFormation, or CDK).

  Produce a prioritized findings report using these severity levels:

  - CRITICAL: Directly exploitable or data-loss risk (open security groups,
    public S3 buckets, unencrypted secrets)
  - HIGH: Likely to cause security or compliance failure (wildcard IAM,
    missing encryption, hardcoded credentials)
  - MEDIUM: Violates team conventions or best practices (missing tags,
    unpinned versions, missing outputs)
  - LOW: Style and maintainability (unclear variable names, missing comments
    on non-obvious resources)

  For each finding output:
    [SEVERITY] Resource name — what the problem is — one-line fix

  Then provide a "Fixes" section with the corrected HCL blocks for all
  CRITICAL and HIGH findings only.

  End with a one-line summary: "X critical, X high, X medium, X low findings."
```

### Walking Through the Workflow

A developer opens `terraform/main.tf` — the Lambda + API Gateway config for the incident alert bot. They type `/iac-review` in the Kiro chat panel:

```
/iac-review
```

Kiro reads the open file and returns a structured report in seconds:

```
## IaC Review — terraform/main.tf

[CRITICAL] aws_apigatewayv2_stage.default — auto_deploy = true on a production
           stage bypasses deployment controls — set auto_deploy = false and use
           explicit deployments

[HIGH] aws_lambda_function.incident_bot — no reserved_concurrent_executions set —
       a runaway invocation loop could exhaust the account Lambda concurrency limit

[MEDIUM] aws_apigatewayv2_api.webhook — missing tags (env, team, cost-center, owner)

[MEDIUM] aws_lambda_function.incident_bot — timeout = 30 is high for a webhook
         receiver; 10s is sufficient and limits blast radius on slow upstream calls

[LOW] aws_apigatewayv2_route.webhook — route_key hardcoded as "POST /webhook";
      consider a variable for easier reuse across environments

---
## Fixes

### CRITICAL — aws_apigatewayv2_stage.default
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.webhook.id
  name        = "$default"
  auto_deploy = false
}

### HIGH — aws_lambda_function.incident_bot
resource "aws_lambda_function" "incident_bot" {
  ...
  reserved_concurrent_executions = 10
}

---
1 critical, 1 high, 2 medium, 1 low findings.
```

The developer fixes the two critical/high issues immediately, before the code ever reaches a PR. The medium and low findings become follow-up tasks. The whole review takes 30 seconds and follows the exact checklist the team agreed on.

---

## Steering vs. Skills: When to Use Each

| Use Steering When... | Use Skills When... |
|---------------------|-------------------|
| The rule applies to **every** agent action | You want to invoke a workflow **on demand** |
| Encoding team conventions, naming rules, standards | Packaging a repeatable task (review, triage, draft) |
| Giving the agent persistent org context | Providing a structured, consistent starting point |
| The instruction is always true | The action depends on what's currently open |

A good rule of thumb: **steering is passive context, skills are active commands**.

Both are committed to the repo. New team members clone the project and immediately have access to the same agent behaviour and the same set of slash commands as everyone else.
