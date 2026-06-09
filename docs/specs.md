---
id: specs
title: Kiro Specs
sidebar_label: Specs
sidebar_position: 2
---

# Kiro Specs

<div className="page-intro">
  <div className="page-intro__icon">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <line x1="8" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="16" x2="11" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </div>
  <div>
    <p className="page-intro__desc">
      Specs are Kiro's structured planning layer — Markdown documents in <code>.kiro/specs/</code> that
      describe what to build. Kiro reads your spec, generates a task plan, and executes it with full diff review at every step.
    </p>
    <div className="page-intro__tags">
      <span className="pi-tag">.kiro/specs/</span>
      <span className="pi-tag">Requirements</span>
      <span className="pi-tag">Design</span>
      <span className="pi-tag">Tasks</span>
    </div>
  </div>
</div>

## What is a Spec?

A **spec** is a structured document you write in Kiro that describes what you want built or automated. Kiro reads the spec, generates a plan, and executes tasks — creating files, writing code, and updating configs on your behalf.

Think of it as a work order: you describe the outcome, Kiro figures out the steps.

Specs live in your project under `.kiro/specs/` and are written in Markdown.

## Spec Structure

Every spec has three sections:

<div className="spec-anatomy">
  <div className="spec-part spec-part--req">
    <div className="spec-part__num">01 — REQUIREMENTS</div>
    <strong>Requirements</strong>
    <p>What this spec must accomplish. Written as user stories or acceptance criteria. This is the <em>why</em>.</p>
  </div>
  <div className="spec-part spec-part--design">
    <div className="spec-part__num">02 — DESIGN</div>
    <strong>Design</strong>
    <p>How it should be built. Architecture decisions, file layout, constraints. This is the <em>how</em>.</p>
  </div>
  <div className="spec-part spec-part--tasks">
    <div className="spec-part__num">03 — TASKS</div>
    <strong>Tasks</strong>
    <p>The ordered list of things Kiro will execute. One file or change per task. This is the <em>what</em>.</p>
  </div>
</div>

```markdown
## Requirements
What this spec must accomplish. Written as user stories or acceptance criteria.

## Design
How it should be built. Architecture decisions, file layout, constraints.

## Tasks
The ordered list of things Kiro will do to complete the spec.
```

Kiro uses the **Requirements** and **Design** sections to understand intent, then generates **Tasks** automatically — or you can write them manually for tighter control.

## Creating Your First Spec

1. Open the Kiro command palette (`Cmd/Ctrl + Shift + P`)
2. Select **Kiro: New Spec**
3. Give it a name (e.g., `incident-runbook-generator`)
4. Fill in Requirements and Design
5. Click **Generate Tasks** or write tasks manually
6. Click **Run Spec**

## SRE Example: Incident Runbook Generator

**File:** `.kiro/specs/incident-runbook-generator.md`

```markdown
## Requirements
- As an on-call engineer, I need a runbook generated from a PagerDuty alert payload
  so that I have immediate, actionable steps without hunting through wikis.
- The runbook must include: alert context, likely causes, diagnostic commands, and escalation path.
- Output format must be Markdown, stored in `runbooks/` with the alert name as filename.

## Design
- Input: PagerDuty webhook JSON (alert name, service, severity, description)
- Processing: Parse alert fields, match against known service patterns in `services/`
- Output: `runbooks/<alert-name>.md` following the standard runbook template
- The generator should be a Python script at `scripts/generate_runbook.py`
- Use Jinja2 templating for the runbook structure

## Tasks
- [ ] Create `scripts/generate_runbook.py` with PagerDuty JSON parsing
- [ ] Create `templates/runbook.j2` with the standard SRE runbook template
- [ ] Add `runbooks/` directory with a `.gitkeep`
- [ ] Write unit tests in `tests/test_generate_runbook.py`
- [ ] Update `README.md` with usage instructions
```

## SRE Example: Terraform Module for ALB + WAF

```markdown
## Requirements
- As a platform engineer, I need a reusable Terraform module that provisions an ALB
  with WAF attached so that all new services start with baseline security controls.
- Module must expose variables for: environment, service name, certificate ARN, allowed CIDRs.
- Must include default WAF rules: rate limiting (1000 req/5min), known bad inputs, SQL injection.

## Design
- Module path: `modules/alb-waf/`
- Follows existing module conventions in this repo (see `modules/rds/` as reference)
- Outputs: alb_arn, alb_dns_name, waf_acl_arn
- Use AWS provider ~> 5.0

## Tasks
- [ ] Create `modules/alb-waf/main.tf` with ALB and WAF ACL resources
- [ ] Create `modules/alb-waf/variables.tf` with documented input variables
- [ ] Create `modules/alb-waf/outputs.tf`
- [ ] Create `modules/alb-waf/README.md` with usage example
- [ ] Add example in `examples/alb-waf/`
```

## SRE Example: On-Call Rotation Script

```markdown
## Requirements
- As an SRE lead, I need a script that reads the PagerDuty on-call schedule and posts
  the weekly rotation to a Slack channel every Monday at 09:00 UTC.
- Must handle gaps in the schedule (alert if no one is on call).
- Must be runnable as a cron job or GitLab scheduled pipeline.

## Design
- Language: Python 3.11+
- PagerDuty API v2 for schedule lookup
- Slack Incoming Webhook for posting
- Config via environment variables: PAGERDUTY_TOKEN, SLACK_WEBHOOK_URL, SCHEDULE_ID
- Script: `scripts/post_oncall_rotation.py`

## Tasks
- [ ] Create `scripts/post_oncall_rotation.py`
- [ ] Add `requirements.txt` with pdpyras and requests
- [ ] Create `.gitlab-ci.yml` scheduled job stanza (weekly, Monday 09:00 UTC)
- [ ] Add `.env.example` with required variables
- [ ] Write tests mocking PagerDuty and Slack responses
```

## Tips for Writing Effective Specs

**Be specific in Requirements.** Vague requirements produce vague output.
- Weak: "Create a monitoring script"
- Strong: "Create a Python script that checks ALB 5xx rate via CloudWatch every 5 minutes and pages PagerDuty if rate exceeds 1% over a 15-minute window"

**Reference existing patterns in Design.** Tell Kiro what already exists.
- "Follow the pattern in `modules/rds/`"
- "Use the logging setup from `lib/logger.py`"
- "Match the test structure in `tests/test_alerts.py`"

**Keep tasks atomic.** One file or one meaningful change per task. Kiro handles each task independently — small tasks are easier to review and retry.

**Iterate.** You can edit a spec mid-run, re-generate tasks, and continue. Specs are living documents.

## What Happens After You Run a Spec

Kiro creates a diff for each task. You review and accept or reject each change — nothing is applied without your approval. Accepted changes are written to disk and can be committed normally.

Rejected tasks are re-queued. You can add notes explaining why before re-running.
