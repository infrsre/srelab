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
      <span className="pi-tag">/triage-alert</span>
      <span className="pi-tag">/postmortem</span>
      <span className="pi-tag">/iac-review</span>
    </div>
  </div>
</div>

## Agent Steering

### What is Steering?

**Steering** is how you give the Kiro agent persistent context about your project, team, and conventions. Instead of repeating "we use Terraform ~> 5.0" or "always add these tags" in every spec or prompt, you write it once in a steering file and the agent applies it automatically.

Steering files live in `.kiro/steering/` as Markdown files. The agent reads all steering files in this directory before every action.

### Steering File Structure

```markdown
# Steering File Title

Any Markdown content. The agent treats this as standing instructions.
Write it like a briefing document for a new team member.
```

You can have multiple steering files — one per concern is a good pattern.

### SRE Example: Infrastructure Standards

```markdown
<!-- .kiro/steering/infrastructure-standards.md -->
# Infrastructure Standards

## AWS
- All resources must be tagged with: env, team, cost-center, and owner
- Use us-east-1 as primary region, us-west-2 for DR
- IAM policies must follow least privilege — never use wildcard actions
- All S3 buckets require versioning and AES-256 encryption at rest

## Terraform
- Provider version: AWS ~> 5.0, required_terraform >= 1.6
- Remote state: S3 backend with DynamoDB locking (see backend.tf for config)
- Module structure: main.tf, variables.tf, outputs.tf, README.md — no exceptions
- Always run terraform fmt and terraform validate before committing
- Tag all resources using the local.common_tags pattern from locals.tf

## Naming Conventions
- Resources: {env}-{team}-{service}-{resource-type} (e.g., prod-sre-alerting-lambda)
- S3 buckets: {org}-{env}-{purpose} (e.g., acme-prod-terraform-state)
- IAM roles: {service}-{env}-role (e.g., alerting-lambda-prod-role)
```

### SRE Example: Incident Response Conventions

```markdown
<!-- .kiro/steering/incident-conventions.md -->
# Incident Response Conventions

## Severity Levels
- SEV1: Customer-facing outage, >10% error rate, or data loss — page immediately
- SEV2: Degraded performance, partial outage — respond within 15 minutes
- SEV3: Non-customer-facing issue or minor degradation — respond within 1 hour
- SEV4: Informational, no immediate action needed

## Runbook Format
All runbooks must follow this structure:
1. Alert description and severity
2. Likely causes (ordered by probability based on historical incidents)
3. Diagnostic commands (copy-paste ready, no placeholders)
4. Resolution steps
5. Escalation path with Slack handles
6. Post-incident checklist

## Communication Templates
- Incident start: Post in #incidents with: service, severity, impact, and "investigating" status
- Update cadence: Every 30 minutes for SEV1/SEV2, hourly for SEV3
- Resolution: Post full timeline and root cause within 24 hours

## Tools in Use
- Alerting: PagerDuty (schedules in pd.company.internal)
- Metrics: CloudWatch + Grafana (grafana.company.internal)
- Logs: CloudWatch Logs + Loki
- Runbooks: This repository at runbooks/
```

### SRE Example: Python and Scripting Standards

```markdown
<!-- .kiro/steering/coding-standards.md -->
# Coding Standards

## Python
- Version: 3.11+
- Formatter: black (line length 100)
- Linter: ruff
- Type hints required on all public functions
- Use structlog for logging (not print or logging.basicConfig)
- Tests: pytest, minimum 80% coverage on new scripts
- Dependencies: pin exact versions in requirements.txt, use pip-compile

## Shell Scripts
- Use bash, set -euo pipefail at the top of every script
- No hardcoded credentials — use AWS SSM Parameter Store or environment variables
- Add a usage() function and check for required arguments

## General
- No secrets in code — use environment variables or AWS Secrets Manager
- All scripts must have a --dry-run flag where applicable
- README.md required for any script directory with more than 2 scripts
```

---

## Skills

### What are Skills?

**Skills** are reusable, named capabilities you install into Kiro. A skill is invoked by typing `/<skill-name>` in the chat panel. Skills are like custom slash commands backed by detailed agent instructions.

Skills live in `.kiro/skills/` as YAML files.

### Skill File Structure

```yaml
# .kiro/skills/<skill-name>.yaml
name: skill-name
description: One-line description shown in the skill picker
instruction: |
  Detailed instructions for the agent.
  This runs when someone invokes /skill-name.
  Can be as long as needed.
```

### SRE Example: `/triage-alert` Skill

Quickly triage an alert by pasting its payload.

```yaml
# .kiro/skills/triage-alert.yaml
name: triage-alert
description: Triage a PagerDuty or CloudWatch alert — paste the payload and get a diagnosis
instruction: |
  The user will paste an alert payload (PagerDuty JSON, CloudWatch alarm, or Grafana alert).

  Your response must include:
  1. **Alert Summary** — Plain English description of what fired and why
  2. **Likely Causes** — Top 3 probable root causes, ordered by likelihood
  3. **Immediate Diagnostics** — Copy-paste-ready CLI commands to run right now
     (use AWS CLI, kubectl, or bash as appropriate for the service)
  4. **Escalation Guidance** — Should this be escalated? To whom? Via what channel?
  5. **Runbook Link** — Check runbooks/ directory for a matching runbook.
     If one exists, reference it. If not, say "No runbook found — consider creating one."

  Be concise. The on-call engineer is under pressure.
```

### SRE Example: `/postmortem` Skill

Draft a postmortem from an incident timeline.

```yaml
# .kiro/skills/postmortem.yaml
name: postmortem
description: Draft a blameless postmortem from an incident timeline or notes
instruction: |
  The user will provide an incident timeline, notes, or a summary.

  Generate a blameless postmortem document with these sections:

  ## Incident Summary
  - Date, duration, severity, services affected

  ## Timeline
  - Chronological table: Time | Event | Who

  ## Root Cause
  - Technical root cause (what broke)
  - Contributing factors (what made it worse or harder to detect)

  ## Impact
  - User-facing impact
  - Internal impact
  - Estimated affected users or error count if provided

  ## What Went Well
  - Detection, response, communication wins

  ## What Could Be Improved
  - Gaps in alerting, runbooks, communication, tooling

  ## Action Items
  - Table: Action | Owner | Due Date | Priority
  - Infer owners from context if mentioned; otherwise leave as TBD

  Save the output as `postmortems/YYYY-MM-DD-<incident-name>.md`.
  Blameless tone throughout — focus on systems and processes, not individuals.
```

### SRE Example: `/iac-review` Skill

Review Terraform or CloudFormation before it goes to PR.

```yaml
# .kiro/skills/iac-review.yaml
name: iac-review
description: Review IaC files for security, compliance, and best practice issues
instruction: |
  Review the open file or selected code as Infrastructure as Code (Terraform, CloudFormation, or CDK).

  Check for and report on:

  **Security**
  - Security groups open to 0.0.0.0/0 on sensitive ports
  - IAM policies with wildcard actions or overly broad resources
  - Unencrypted storage (S3, RDS, EBS, EFS)
  - Public-facing resources that should be private
  - Hardcoded secrets, account IDs, or ARNs

  **Compliance**
  - Missing required tags (env, team, cost-center, owner)
  - Resources in non-approved regions
  - Missing backup or retention policies on stateful resources

  **Best Practices**
  - Unpinned provider or module versions
  - Missing outputs that callers likely need
  - Resources that could be replaced with a shared module

  Format the output as a prioritized list: CRITICAL, HIGH, MEDIUM, LOW.
  For each finding: what it is, why it matters, and the fix.
```

### SRE Example: `/oncall-brief` Skill

Get a situational briefing when starting an on-call shift.

```yaml
# .kiro/skills/oncall-brief.yaml
name: oncall-brief
description: Generate a situational awareness brief for the start of an on-call shift
instruction: |
  The engineer is starting an on-call shift. Generate a briefing document they can read
  in under 5 minutes to get up to speed.

  Include:

  ## Recent Incidents (last 7 days)
  - Check the incidents/ directory for recent incident docs
  - Summarize: title, severity, resolution status, open action items

  ## Open Action Items
  - List any unresolved items from recent postmortems

  ## Known Fragile Areas
  - Based on recurring incidents or TODO comments in runbooks, highlight systems
    that have been unstable recently

  ## Useful Links
  - Reference the links section of .kiro/steering/ files for dashboards, runbooks, escalation paths

  ## Recommended First Steps
  - What should the engineer check first at the start of shift?

  Keep it scannable. Use bullet points, not paragraphs.
```

## Steering vs. Skills: When to Use Each

| Use Steering When... | Use Skills When... |
|---------------------|-------------------|
| You want the rule applied to **every** agent interaction | You want to invoke a capability **on demand** |
| Setting conventions, standards, naming rules | Running a repeatable workflow (triage, review, draft) |
| Giving the agent org/team context | Providing a structured task template |
| The rule is always true | The action is situational |

A good rule of thumb: **steering is passive, skills are active**.
