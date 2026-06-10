---
id: tutorial-first-spec
title: "Tutorial: Build a CloudWatch Alert with Kiro"
sidebar_label: "Tutorial: Your First Spec"
sidebar_position: 3
---

# Tutorial: Build a CloudWatch Alert with Kiro

<div className="page-intro">
  <div className="page-intro__icon">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  </div>
  <div>
    <p className="page-intro__desc">
      A complete beginner walkthrough. You'll write a Kiro Spec, watch the agent build real AWS infrastructure,
      review every change, and ship a working CloudWatch alerting setup — without writing a single line of Terraform manually.
    </p>
    <div className="page-intro__tags">
      <span className="pi-tag">~20 min</span>
      <span className="pi-tag">Beginner</span>
      <span className="pi-tag">AWS / Terraform</span>
      <span className="pi-tag">Real-world SRE</span>
    </div>
  </div>
</div>

## What You'll Build

You're an SRE engineer. Your ECS service (`payments-api`) went down last week and nobody got paged. Your task: set up CloudWatch alarms so the team gets a PagerDuty alert when:

- CPU usage exceeds **80%** for 5 minutes
- ALB 5xx error rate exceeds **1%** over 15 minutes
- ECS task count drops below **2** (the minimum healthy count)

You'll do all of this through Kiro — no manually writing Terraform, no hunting CloudWatch docs.

<div className="tutorial-outcome">
  <div className="tutorial-outcome__icon">✓</div>
  <div>
    <strong>End result:</strong> A Terraform module at <code>modules/cloudwatch-alerts/</code> with three alarms,
    SNS topic, PagerDuty integration, and a runbook linked from each alert. Reviewed, accepted, and commit-ready.
  </div>
</div>

---

## Before You Start

You need:
- **Kiro installed** — download from [kiro.dev](https://kiro.dev)
- **A project repo open in Kiro** — any repo with a `modules/` folder works, or create an empty one
- **5 minutes** to read the spec format once before writing your own

:::tip New to Kiro?
If you haven't opened Kiro before, launch it and open a folder (`File → Open Folder`). Kiro works on top of your existing repo — it doesn't replace your editor.
:::

---

## Step 1 — Open the Kiro Command Palette

Press **`Cmd + Shift + P`** (Mac) or **`Ctrl + Shift + P`** (Windows/Linux) to open the command palette.

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">Kiro — payments-api</span>
  </div>
  <div className="ide-window__body">
    <div className="ide-cmd-palette">
      <div className="ide-cmd-palette__input">
        <span className="ide-cmd-palette__icon">⌘</span>
        <span className="ide-cmd-palette__text">Kiro: New Spec<span className="ide-cmd-palette__cursor">|</span></span>
      </div>
      <div className="ide-cmd-palette__results">
        <div className="ide-cmd-palette__item ide-cmd-palette__item--active">
          <span className="ide-cmd-palette__item-icon">📄</span>
          <span><strong>Kiro: New Spec</strong> — Create a new spec in .kiro/specs/</span>
        </div>
        <div className="ide-cmd-palette__item">
          <span className="ide-cmd-palette__item-icon">▶</span>
          <span>Kiro: Run Spec — Execute the current spec file</span>
        </div>
        <div className="ide-cmd-palette__item">
          <span className="ide-cmd-palette__item-icon">🔧</span>
          <span>Kiro: Generate Tasks — Auto-generate task list from Requirements + Design</span>
        </div>
      </div>
    </div>
  </div>
</div>

Type **`Kiro: New Spec`** and press Enter. Kiro will prompt you for a name.

Enter: `cloudwatch-alerts-payments`

Kiro creates `.kiro/specs/cloudwatch-alerts-payments.md` and opens it for editing.

---

## Step 2 — Write Your Requirements

The **Requirements** section answers: *What must this do, and why?*

Write it from the perspective of the person who needs it (you, the on-call engineer):

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">.kiro/specs/cloudwatch-alerts-payments.md</span>
  </div>
  <div className="ide-window__body ide-window__body--code">

```markdown
## Requirements

- As an on-call SRE, I need CloudWatch alarms for the payments-api ECS service
  so that I get paged immediately when the service degrades.

- Alarm 1 — CPU: Alert when ECS CPU utilization > 80% for 5 consecutive minutes.
- Alarm 2 — 5xx rate: Alert when ALB HTTPCode_Target_5XX_Count / RequestCount > 1%
  over any 15-minute window.
- Alarm 3 — Task count: Alert when ECS RunningTaskCount < 2 for 3 minutes.

- All alarms must route to PagerDuty via SNS.
- Each alarm description must include a link to the relevant runbook in `runbooks/`.
- Terraform must use variables for: environment, service_name, pagerduty_endpoint.
- Module must be reusable — other services should be able to call it with their own values.
```

  </div>
</div>

:::info Why write it this way?
User-story format ("As a [role], I need [thing] so that [reason]") gives Kiro context on *who* benefits and *why* it matters. This produces better generated code than a plain bullet list.
:::

---

## Step 3 — Write Your Design

The **Design** section answers: *How should it be built?*

This is where you tell Kiro the architecture — file layout, conventions, and any existing patterns to follow:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">.kiro/specs/cloudwatch-alerts-payments.md</span>
  </div>
  <div className="ide-window__body ide-window__body--code">

```markdown
## Design

- Module path: `modules/cloudwatch-alerts/`
- Follow the structure of the existing `modules/rds-alarms/` module (variables.tf,
  main.tf, outputs.tf, README.md)
- Use AWS provider ~> 5.0
- Alarm actions: SNS topic ARN passed as a variable (pagerduty_sns_arn)
- Metric filters:
    - CPU: AWS/ECS namespace, CPUUtilization metric, dimensions: ClusterName + ServiceName
    - 5xx: AWS/ApplicationELB, HTTPCode_Target_5XX_Count + RequestCount (expression alarm)
    - Tasks: ECS/ContainerInsights, RunningTaskCount
- Expression alarm for 5xx rate:
    RATE = m_5xx / m_requests * 100
    Threshold: > 1, treat_missing_data = "notBreaching"
- Outputs: alarm_arns (list), sns_topic_arn
- Example usage in `examples/cloudwatch-alerts-payments/main.tf`
```

  </div>
</div>

:::tip Reference what already exists
Saying **"follow the structure of `modules/rds-alarms/`"** tells Kiro to read that module first and match its style. This is one of the most powerful things you can put in a Design section — Kiro will inherit your team's conventions automatically.
:::

---

## Step 4 — Generate Tasks

Now click **Generate Tasks** in the Kiro sidebar (or run `Kiro: Generate Tasks` from the command palette).

Kiro reads your Requirements and Design, then proposes a task list:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">Kiro — Generate Tasks</span>
  </div>
  <div className="ide-window__body ide-window__body--code">

```markdown
## Tasks

- [ ] 1. Create `modules/cloudwatch-alerts/variables.tf` with documented inputs:
         environment, service_name, cluster_name, alb_arn_suffix,
         pagerduty_sns_arn, cpu_threshold, error_rate_threshold, min_task_count
- [ ] 2. Create `modules/cloudwatch-alerts/main.tf` with:
         - aws_cloudwatch_metric_alarm for CPU
         - aws_cloudwatch_metric_alarm for 5xx rate (metric math expression)
         - aws_cloudwatch_metric_alarm for running task count
- [ ] 3. Create `modules/cloudwatch-alerts/outputs.tf` with alarm_arns and sns_topic_arn
- [ ] 4. Create `modules/cloudwatch-alerts/README.md` with usage example and variable docs
- [ ] 5. Create `examples/cloudwatch-alerts-payments/main.tf` calling the module
         with payments-api values
- [ ] 6. Update `runbooks/payments-api-cpu.md` with alarm context and diagnostic steps
- [ ] 7. Update `runbooks/payments-api-5xx.md` with triage steps and escalation path
- [ ] 8. Update `runbooks/payments-api-tasks.md` with ECS task recovery steps
```

  </div>
</div>

Look over the task list. If Kiro missed something or split a task wrong, edit it directly — it's just Markdown. When you're happy, move on.

---

## Step 5 — Run the Spec

Click **Run Spec** (or `Kiro: Run Spec`). The agent starts executing tasks one by one.

Watch the Kiro Agent panel on the right side of your screen:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">Kiro Agent — cloudwatch-alerts-payments</span>
  </div>
  <div className="ide-window__body">
    <div className="agent-log">
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>Task 1 — Reading <code>modules/rds-alarms/variables.tf</code> for reference...</span>
      </div>
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>Task 1 — Writing <code>modules/cloudwatch-alerts/variables.tf</code></span>
      </div>
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>Task 2 — Writing <code>modules/cloudwatch-alerts/main.tf</code> (CPU alarm)</span>
      </div>
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>Task 2 — Writing <code>modules/cloudwatch-alerts/main.tf</code> (5xx rate expression alarm)</span>
      </div>
      <div className="agent-log__line agent-log__line--active">
        <span className="agent-log__status agent-log__status--spin">◌</span>
        <span>Task 2 — Writing <code>modules/cloudwatch-alerts/main.tf</code> (task count alarm)...</span>
      </div>
      <div className="agent-log__line agent-log__line--pending">
        <span className="agent-log__status">○</span>
        <span>Task 3 — outputs.tf</span>
      </div>
      <div className="agent-log__line agent-log__line--pending">
        <span className="agent-log__status">○</span>
        <span>Task 4 — README.md</span>
      </div>
      <div className="agent-log__line agent-log__line--pending">
        <span className="agent-log__status">○</span>
        <span>Tasks 5–8 — pending</span>
      </div>
    </div>
  </div>
</div>

You don't need to do anything here — Kiro is working. Grab a coffee. It takes 30–60 seconds per task depending on file size.

---

## Step 6 — Review the Diff

When a task completes, Kiro surfaces a **diff** in the editor. Nothing is written to disk until you accept it.

Here's what the `main.tf` diff looks like:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">Diff — modules/cloudwatch-alerts/main.tf</span>
  </div>
  <div className="ide-window__body ide-window__body--diff">

```diff
+ resource "aws_cloudwatch_metric_alarm" "cpu_high" {
+   alarm_name          = "${var.environment}-${var.service_name}-cpu-high"
+   alarm_description   = "CPU > ${var.cpu_threshold}% for 5min. Runbook: runbooks/payments-api-cpu.md"
+   comparison_operator = "GreaterThanThreshold"
+   evaluation_periods  = 5
+   metric_name         = "CPUUtilization"
+   namespace           = "AWS/ECS"
+   period              = 60
+   statistic           = "Average"
+   threshold           = var.cpu_threshold
+   alarm_actions       = [var.pagerduty_sns_arn]
+   ok_actions          = [var.pagerduty_sns_arn]
+
+   dimensions = {
+     ClusterName = var.cluster_name
+     ServiceName = var.service_name
+   }
+ }
+
+ resource "aws_cloudwatch_metric_alarm" "error_rate_high" {
+   alarm_name          = "${var.environment}-${var.service_name}-5xx-rate"
+   alarm_description   = "5xx rate > ${var.error_rate_threshold}%. Runbook: runbooks/payments-api-5xx.md"
+   comparison_operator = "GreaterThanThreshold"
+   evaluation_periods  = 3
+   threshold           = var.error_rate_threshold
+   treat_missing_data  = "notBreaching"
+   alarm_actions       = [var.pagerduty_sns_arn]
+
+   metric_query {
+     id          = "m_5xx"
+     return_data = false
+     metric {
+       metric_name = "HTTPCode_Target_5XX_Count"
+       namespace   = "AWS/ApplicationELB"
+       period      = 300
+       stat        = "Sum"
+       dimensions  = { LoadBalancer = var.alb_arn_suffix }
+     }
+   }
+   # ... (metric_query for requests and rate expression)
+ }
```

  </div>
</div>

**For each task you have three options:**

<div className="review-options">
  <div className="review-option review-option--accept">
    <strong>✓ Accept</strong>
    <p>Writes the file to disk. Move to the next task.</p>
  </div>
  <div className="review-option review-option--reject">
    <strong>✗ Reject</strong>
    <p>Discards the change. Kiro re-queues the task — you can add a note explaining what to fix.</p>
  </div>
  <div className="review-option review-option--edit">
    <strong>✎ Edit then Accept</strong>
    <p>Modify the diff inline before accepting. Good for small tweaks.</p>
  </div>
</div>

:::tip What to look for when reviewing
- Variable names match your team's convention (`var.environment` not `var.env`)
- Alarm thresholds match your SLO targets
- Runbook links point to files that actually exist
- `treat_missing_data` is set correctly (missing data should not trigger alarms)
:::

Accept all tasks. Kiro marks each task `[x]` in the spec as it's accepted.

---

## Step 7 — The Finished Spec

After all tasks are accepted, your spec looks like this:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">.kiro/specs/cloudwatch-alerts-payments.md</span>
  </div>
  <div className="ide-window__body ide-window__body--code">

```markdown
## Tasks

- [x] 1. Create `modules/cloudwatch-alerts/variables.tf`
- [x] 2. Create `modules/cloudwatch-alerts/main.tf`
- [x] 3. Create `modules/cloudwatch-alerts/outputs.tf`
- [x] 4. Create `modules/cloudwatch-alerts/README.md`
- [x] 5. Create `examples/cloudwatch-alerts-payments/main.tf`
- [x] 6. Update `runbooks/payments-api-cpu.md`
- [x] 7. Update `runbooks/payments-api-5xx.md`
- [x] 8. Update `runbooks/payments-api-tasks.md`
```

  </div>
</div>

All 8 tasks checked. Your file tree now has:

```
modules/
  cloudwatch-alerts/
    main.tf          ← 3 alarms + SNS wiring
    variables.tf     ← 8 documented input variables
    outputs.tf       ← alarm_arns, sns_topic_arn
    README.md        ← usage docs
examples/
  cloudwatch-alerts-payments/
    main.tf          ← real usage example for payments-api
runbooks/
  payments-api-cpu.md    ← updated with alarm context
  payments-api-5xx.md    ← updated with triage steps
  payments-api-tasks.md  ← updated with ECS recovery steps
```

---

## Step 8 — Iterate: Reject and Fix a Task

Let's say when you reviewed Task 6 (`payments-api-cpu.md`), Kiro generated a generic runbook but your team requires a specific **Escalation Matrix** section. Reject it:

1. Click **Reject** on the diff
2. Kiro re-opens Task 6 with a note field
3. Type: `"Add an Escalation Matrix section: L1 = on-call SRE, L2 = payments team lead, L3 = platform VP"`
4. Click **Re-run Task**

Kiro re-generates only that task with your note as additional context. The rest of your accepted tasks are untouched.

<div className="tutorial-callout">
  <div className="tutorial-callout__icon">💡</div>
  <div>
    <strong>This is the iteration loop.</strong> Write spec → Run → Review → Reject with notes → Re-run.
    Most SREs do 1–2 rejection cycles per spec before everything is exactly right.
  </div>
</div>

---

## Step 9 — Add Steering (Optional but Recommended)

You notice Kiro used `snake_case` for alarm names, but your team standard is `kebab-case`. Instead of rejecting and re-running, add a **steering file** so every future spec follows your convention automatically.

Create `.kiro/steering/terraform-conventions.md`:

```markdown
# Terraform Conventions

- All resource names use kebab-case: `payments-api-cpu-high`, not `payments_api_cpu_high`
- Every CloudWatch alarm description must include a runbook link in the format:
  `Runbook: https://wiki.internal/runbooks/<service>-<alarm>`
- Use `treat_missing_data = "notBreaching"` on all rate-based alarms
- Tag all resources with: Environment, Service, Team, ManagedBy=terraform
```

From now on, every spec Kiro runs in this repo will follow these rules — no reminder needed.

---

## Step 10 — Commit and Deploy

Your changes are on disk, unmodified from what you reviewed. Commit normally:

```bash
git add modules/cloudwatch-alerts/ examples/ runbooks/
git commit -m "feat: add CloudWatch alarms for payments-api via Kiro spec"
git push origin main
```

Your CI pipeline picks it up, runs `terraform plan`, and your team reviews the plan output before apply — exactly the same review process as hand-written Terraform.

<div className="tutorial-outcome">
  <div className="tutorial-outcome__icon">🎉</div>
  <div>
    <strong>Done.</strong> You wrote a spec in ~5 minutes and Kiro produced production-ready Terraform and runbooks.
    The payments-api team will get paged next time CPU spikes — before customers notice.
  </div>
</div>

---

## What You Learned

<div className="kiro-pillars" style={{marginTop: '1rem'}}>
  <div className="kiro-pillar" style={{cursor: 'default'}}>
    <div className="kiro-pillar__icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    </div>
    <div className="kiro-pillar__content">
      <div className="kiro-pillar__title">Specs drive everything</div>
      <div className="kiro-pillar__desc">Requirements + Design + Tasks = a complete, reviewable work order for Kiro.</div>
    </div>
  </div>
  <div className="kiro-pillar" style={{cursor: 'default'}}>
    <div className="kiro-pillar__icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><polyline points="8,12 11,15 16,9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
    <div className="kiro-pillar__content">
      <div className="kiro-pillar__title">You review every diff</div>
      <div className="kiro-pillar__desc">Nothing writes to disk without your explicit accept. Reject with a note to iterate.</div>
    </div>
  </div>
  <div className="kiro-pillar" style={{cursor: 'default'}}>
    <div className="kiro-pillar__icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="2" x2="12" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="15" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    </div>
    <div className="kiro-pillar__content">
      <div className="kiro-pillar__title">Steering carries your conventions</div>
      <div className="kiro-pillar__desc">Write your team rules once in <code>.kiro/steering/</code>. Kiro follows them in every future spec.</div>
    </div>
  </div>
</div>

---

## Next Steps

- **[Specs deep dive →](specs)** — Learn all spec patterns: iterating mid-run, splitting specs, referencing existing code
- **[Agent Hooks →](agent-hooks)** — Auto-trigger a spec when a new service folder is created
- **[Steering & Skills →](steering-skills)** — Add team-wide conventions and reusable slash-command workflows
- **[MCP →](mcp)** — Connect Kiro to live AWS so it can read your actual CloudWatch metrics while writing alarms
