---
id: best-practices
title: Best Practices
sidebar_label: Best Practices
sidebar_position: 7
---

# Kiro Best Practices for SRE

<div className="page-intro">
  <div className="page-intro__icon">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <polyline points="9,12 11,14 15,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
  <div>
    <p className="page-intro__desc">
      Lessons learned from running Kiro in SRE workflows. Apply these from day one to avoid the most
      common pitfalls with specs, hooks, skills, and MCP security.
    </p>
    <div className="page-intro__tags">
      <span className="pi-tag">Setup</span>
      <span className="pi-tag">Specs</span>
      <span className="pi-tag">Hooks</span>
      <span className="pi-tag">Skills</span>
      <span className="pi-tag">MCP Security</span>
      <span className="pi-tag">Team Adoption</span>
    </div>
  </div>
</div>

Lessons learned from the SRE POC. Apply these from day one to avoid common pitfalls.

---

## Setup

### Start with Steering Before Anything Else

Before writing your first spec or hook, create your steering files. The agent applies steering to every action — setting it up first means all subsequent work benefits immediately.

Minimum recommended steering files for SRE:
- `infrastructure-standards.md` — AWS tagging, Terraform version, naming conventions
- `incident-conventions.md` — severity levels, runbook format, communication templates
- `coding-standards.md` — language versions, formatters, test requirements

### Pin MCP Server Versions

MCP servers are npm or Python packages. Unpinned versions can introduce breaking changes silently.

```json
// Pinned — safe
"args": ["awslabs.aws-mcp-server@1.2.3"]

// Unpinned — risky in production workflows
"args": ["awslabs.aws-mcp-server@latest"]
```

Use `@latest` while exploring. Pin versions once a workflow is in regular use.

### Use Read-Only Credentials for MCP

Never give MCP servers write access to production systems. Create a dedicated IAM role or service account with read-only permissions.

```
Recommended MCP IAM permissions (AWS):
- cloudwatch:GetMetricData, GetMetricStatistics
- logs:DescribeLogGroups, GetLogEvents, FilterLogEvents
- ec2:Describe*
- ecs:Describe*, List*
- rds:Describe*
- elasticloadbalancing:Describe*
```

Write operations (creating resources, triggering deployments) should remain explicit human actions.

### Add `.kiro/` to Your Gitignore Selectively

Check in: `.kiro/specs/`, `.kiro/hooks/`, `.kiro/skills/`, `.kiro/steering/`  
These are team assets — version control them.

Be careful with: `.kiro/settings.json`  
It may contain environment-specific paths. If it does, add it to `.gitignore` and provide a `.kiro/settings.json.example` instead.

---

## Writing Specs

### Write Requirements as Acceptance Criteria

Requirements that read like acceptance criteria produce better output than vague descriptions.

```markdown
// Weak
- Needs a monitoring script

// Strong
- When ALB 5xx rate exceeds 1% over a 15-minute window, the script must
  publish a message to the SNS topic defined in var.alert_topic_arn
- The script must run as a CloudWatch Alarm action, not on a cron
- False positive rate must be under 5% based on last 30 days of baseline data
```

### Always Include a Design Section

Even a short Design section drastically improves output quality. At minimum, specify:
- Language and key libraries
- File paths for generated output
- Any existing code to follow as a pattern

### Break Large Specs into Sub-Specs

A spec that generates 20+ files is hard to review and easy to derail. Split it:
- `alb-waf-module.md` — the Terraform module
- `alb-waf-tests.md` — the test suite
- `alb-waf-docs.md` — README and usage examples

Run them in order. Each spec's output feeds context into the next.

### Review Every Diff Before Accepting

Kiro shows diffs for a reason. Read them. The agent is generally correct but can:
- Miss a naming convention not covered in steering
- Make assumptions about file structure
- Introduce a dependency that conflicts with an existing one

One missed diff in a Terraform module can cascade into a broken plan.

---

## Writing Hooks

### Test Hooks with `manual` Trigger First

Before a hook fires automatically, test it:

1. Set `trigger.type: manual`
2. Invoke it from the command palette
3. Verify the output is correct on 3+ different files
4. Switch to the real trigger type

Automated hooks that produce bad output can create noise across your entire project.

### Avoid Hook Loops

A hook that saves a file can trigger another save hook. Design hooks so their **output path never matches their trigger glob**.

```yaml
# Safe — trigger is alerts/, output is runbooks/
trigger:
  glob: "alerts/**/*.yaml"
instruction: "...save output to runbooks/..."

# Risky — hook modifies a .tf file, which triggers the hook again
trigger:
  glob: "**/*.tf"
instruction: "...add a comment to the file..."
```

### Keep Hook Instructions Narrow

Hooks run on every matching event. Broad instructions produce inconsistent and slow results.

```yaml
# Broad — agent does too much unpredictably
instruction: "Review this file and improve it."

# Narrow — specific, verifiable, consistent
instruction: |
  Check this Terraform file for resources missing the required tags:
  env, team, cost-center, owner.
  Report findings only — do not modify the file.
  Output a one-line summary per missing tag.
```

---

## Writing Skills

### Write Skills for Repeated Workflows

If you have asked the agent the same type of question three or more times, it belongs in a skill. Skills make that workflow available to everyone on the team with a single slash command.

High-value SRE skills: `/triage-alert`, `/postmortem`, `/iac-review`, `/oncall-brief`, `/cost-anomaly`

### Include Output Format in the Instruction

Tell the skill exactly what to produce. Without this, the output format varies between runs and between engineers.

```yaml
instruction: |
  ...
  Format the output as:
  ## Finding: <title>
  **Severity:** CRITICAL | HIGH | MEDIUM | LOW
  **What:** One sentence description
  **Why it matters:** One sentence
  **Fix:** Code block or step-by-step
```

### Share Skills in the Team Repo

Skills in `.kiro/skills/` are version-controlled. When you write a skill that helps you, commit it — it immediately helps everyone else on the team.

Document new skills in a `skills/README.md` with a one-line description and example invocation.

---

## MCP Security

### Rotate Tokens Regularly

MCP server tokens (PagerDuty, GitHub, etc.) should rotate on the same schedule as other service account credentials. Add them to your secrets rotation policy.

### Monitor MCP Tool Calls

Kiro logs every MCP call. Periodically review the logs (`.kiro/mcp-activity.log` if configured) to catch unexpected tool usage or over-broad queries.

### Principle of Least Privilege

Each MCP server should have exactly the permissions it needs — no more. Separate read and write servers if write access is ever needed, and treat write-capable servers as high-risk.

---

## Collaboration and Team Adoption

### Document Non-Obvious Steering Choices

When you add a rule to a steering file that isn't obvious from code conventions, add a one-line comment explaining why.

```markdown
<!-- Use us-east-1 as primary — our compliance certification covers this region only -->
- Use us-east-1 as primary region
```

### Use Specs as Onboarding Material

Specs double as documentation. A well-written spec for a Terraform module teaches the next engineer what the module does, why it's structured that way, and how to extend it — without reading the code.

### Run a Weekly "Kiro Wins" Share

Spend 10 minutes per week sharing one spec, hook, or skill that saved time. This accelerates adoption faster than any written guide. Capture the best examples in this documentation.
