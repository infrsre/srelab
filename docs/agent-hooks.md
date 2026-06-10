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

## What are Hooks?

**Hooks** are event-driven triggers that automatically invoke the Kiro agent when something happens in your project. Instead of manually asking Kiro to do something, you define conditions — and Kiro acts on them.

Hooks live in `.kiro/hooks/` as YAML files. Each hook specifies:
- **When** to fire (the trigger event)
- **What** to do (the agent instruction)
- **Where** to apply it (optional file or path filter)

## Hook File Structure

```yaml
# .kiro/hooks/<hook-name>.yaml
name: Hook Display Name
description: What this hook does
trigger:
  type: <event-type>
  # event-specific config
instruction: |
  The natural language instruction for the agent.
  Can be multi-line. Reference {{variables}} from the event context.
```

## Trigger Types

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

## SRE Example: Auto-Update Runbook on Alert Config Change

When an engineer modifies an alerting rule, the corresponding runbook should be flagged as potentially stale.

```yaml
# .kiro/hooks/flag-stale-runbooks.yaml
name: Flag Stale Runbooks
description: Marks runbooks as potentially outdated when alert configs change
trigger:
  type: file_save
  glob: "alerts/**/*.yaml"
instruction: |
  The alert configuration file {{file_path}} was just modified.
  Review the runbooks/ directory for any runbook that references this alert.
  If a matching runbook exists, add a warning banner at the top:

  > ⚠️ This runbook may be outdated. Alert config last changed: {{timestamp}}.
  > Review and update before next incident.

  If no matching runbook exists, note it in runbooks/REVIEW-NEEDED.md.
```

## SRE Example: Validate Terraform on Save

Catch common Terraform mistakes immediately, before a plan or apply.

```yaml
# .kiro/hooks/validate-terraform.yaml
name: Validate Terraform on Save
description: Runs static analysis and best-practice checks on saved Terraform files
trigger:
  type: file_save
  glob: "**/*.tf"
instruction: |
  The file {{file_path}} was just saved.
  Review it for the following issues and report findings inline as code comments:

  1. Resources missing required tags (env, team, cost-center)
  2. Security groups with 0.0.0.0/0 ingress on non-443/80 ports
  3. Hardcoded AWS account IDs or ARNs (should be variables or data sources)
  4. S3 buckets without versioning or encryption enabled
  5. IAM policies with wildcard actions ("*")

  Do not modify the file. Output a summary of findings only.
```

## SRE Example: Generate Changelog Entry on Spec Complete

After a spec runs, automatically draft a changelog entry so nothing gets lost.

```yaml
# .kiro/hooks/spec-changelog.yaml
name: Draft Changelog on Spec Complete
description: Creates a CHANGELOG entry when a spec finishes
trigger:
  type: spec_complete
instruction: |
  Spec "{{spec_name}}" just completed with the following tasks:
  {{completed_tasks}}

  Add an entry to CHANGELOG.md under the [Unreleased] section with:
  - A one-line summary of what changed
  - The affected components (inferred from changed file paths)
  - Date: {{date}}

  Follow the existing CHANGELOG.md format exactly.
```

## SRE Example: Post Incident Summary on Git Commit

When an engineer commits to the `incidents/` directory, post a summary to Microsoft Teams.

```yaml
# .kiro/hooks/incident-summary-notify.yaml
name: Notify on Incident Doc Commit
description: Posts a Teams-ready summary when an incident doc is committed
trigger:
  type: git_commit
  paths:
    - "incidents/**"
instruction: |
  A commit was just made that includes changes to: {{changed_files}}

  Read the modified incident document(s) and produce a Microsoft Teams-formatted summary:
  - Incident title and severity
  - Duration (start/end from the doc)
  - Root cause (one sentence)
  - Action items with owners (bulleted)

  Save the summary to incidents/summaries/{{commit_sha}}.md
  so it can be posted to Microsoft Teams via the CI pipeline.
```

## SRE Example: Manual Hook — Diagnose High CPU Alert

A hook you invoke on demand when a CPU alert fires, giving the agent context to help triage.

```yaml
# .kiro/hooks/diagnose-cpu-alert.yaml
name: Diagnose High CPU Alert
description: Guides incident response for CPU saturation alerts
trigger:
  type: manual
instruction: |
  A high CPU alert has fired. Help me triage it:

  1. List the most likely causes of CPU saturation for a Python web service on EC2.
  2. Provide the exact CloudWatch CLI commands to pull CPU metrics for the last 30 minutes.
  3. Provide the commands to get the top 10 CPU-consuming processes via SSM Run Command.
  4. Draft a Microsoft Teams message to post in the incidents channel with: alert name, time, current status (investigating),
     and a link placeholder for the runbook.

  Format each step clearly. I will run commands and paste output back for further analysis.
```

## Hook Best Practices

**Keep instructions specific.** Hooks run without human prompting — vague instructions produce inconsistent results.

**Use file globs to limit scope.** A `file_save` hook on `**/*` fires constantly. Target it: `terraform/**/*.tf`, `alerts/*.yaml`.

**Prefer read-only hooks for automation.** Hooks that modify files can cause loops (save → hook fires → saves → hook fires). Make sure your hook only writes to a different path than its trigger.

**Test with `manual` triggers first.** Before setting a hook to fire automatically, set `type: manual` and run it a few times to verify the output is correct.

**Log hook activity.** Add an instruction line to append a line to `.kiro/hook-log.md` with the timestamp and file — useful for auditing what the agent changed and when.
