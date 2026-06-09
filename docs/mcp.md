---
id: mcp
title: MCP (Model Context Protocol)
sidebar_label: MCP
sidebar_position: 5
---

# MCP — Model Context Protocol

## What is MCP?

**MCP (Model Context Protocol)** is an open standard that lets AI agents connect to external tools, APIs, and data sources. In Kiro, MCP servers extend what the agent can do — instead of just reading your local files, it can query live infrastructure, pull metrics, read tickets, and take actions in external systems.

Think of MCP servers as plugins that give the agent real-world reach.

## How MCP Works in Kiro

```
You ask Kiro a question
  └── Kiro checks available MCP servers
       └── Calls the right server's tool (e.g., aws_cloudwatch.get_metric)
            └── Gets live data back
                 └── Incorporates it into its response
```

MCP servers run locally alongside Kiro. They expose a set of **tools** (functions) and optionally **resources** (data the agent can read). Kiro discovers them automatically once configured.

## Configuring MCP in Kiro

MCP servers are configured in `.kiro/settings.json`:

```json
{
  "mcpServers": {
    "aws": {
      "command": "uvx",
      "args": ["awslabs.aws-mcp-server@latest"],
      "env": {
        "AWS_PROFILE": "your-profile",
        "AWS_REGION": "us-east-1"
      }
    },
    "kubernetes": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-kubernetes"],
      "env": {
        "KUBECONFIG": "/Users/you/.kube/config"
      }
    }
  }
}
```

After saving, restart Kiro. Open the MCP panel (`Cmd/Ctrl + Shift + M`) to verify the server connected and see available tools.

## SRE-Relevant MCP Servers

### AWS MCP Server

Gives Kiro direct access to your AWS environment.

**Install:**
```bash
uvx awslabs.aws-mcp-server@latest
```

**Capabilities for SRE:**
- Query CloudWatch metrics and alarms
- List EC2 instances, ECS services, Lambda functions
- Read CloudWatch Logs log groups and streams
- Describe RDS instances, ElastiCache clusters
- Check Auto Scaling Group state
- List S3 buckets and their configurations

**Config:**
```json
"aws": {
  "command": "uvx",
  "args": ["awslabs.aws-mcp-server@latest"],
  "env": {
    "AWS_PROFILE": "sre-readonly",
    "AWS_REGION": "us-east-1"
  }
}
```

Use a **read-only IAM role** for the MCP server. You do not want the agent making changes to production infrastructure autonomously.

**Example prompt with AWS MCP active:**
> "Check the 5xx error rate on the payment-service ALB for the last hour and tell me if it's above baseline."

Kiro will call CloudWatch directly and return a real answer.

---

### Kubernetes MCP Server

Lets Kiro inspect live cluster state.

**Install:**
```bash
npm install -g @modelcontextprotocol/server-kubernetes
```

**Capabilities for SRE:**
- List pods, deployments, services, ingresses
- Read pod logs
- Describe nodes and check resource pressure
- Check HPA and replica counts
- Read ConfigMaps and Secrets (names only, not values)

**Config:**
```json
"kubernetes": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-kubernetes"],
  "env": {
    "KUBECONFIG": "/home/you/.kube/config",
    "KUBE_CONTEXT": "prod-cluster"
  }
}
```

**Example prompt:**
> "Are there any pods in CrashLoopBackOff in the prod namespace? If so, pull the last 50 log lines for each."

---

### PagerDuty MCP Server

Connect Kiro to your incident management workflow.

**Install:**
```bash
npm install -g @modelcontextprotocol/server-pagerduty
```

**Capabilities for SRE:**
- List active incidents and their status
- Read incident details, timeline, and responders
- Look up on-call schedules
- List services and their current health

**Config:**
```json
"pagerduty": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-pagerduty"],
  "env": {
    "PAGERDUTY_API_TOKEN": "${env:PAGERDUTY_API_TOKEN}"
  }
}
```

Note: Use `${env:VAR}` syntax to pull values from your shell environment — never hardcode tokens.

**Example prompt:**
> "What SEV1 and SEV2 incidents are open right now? Summarize each with affected service, duration, and current responder."

---

### GitHub / GitLab MCP Server

Gives Kiro context from your source control and CI/CD.

**Install (GitHub):**
```bash
npm install -g @modelcontextprotocol/server-github
```

**Capabilities for SRE:**
- Read open pull requests and their diffs
- List recent pipeline runs and failures
- Read issues and their labels
- Search code across repositories

**Config (GitHub):**
```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
  }
}
```

**Example prompt:**
> "Are there any open PRs touching the alerting module that haven't been reviewed in over 48 hours?"

---

### Filesystem MCP Server

Expands Kiro's file access beyond the current project.

**Install:**
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

**Capabilities:**
- Read files outside the current workspace (runbook archives, shared config repos, etc.)
- Useful for referencing a shared SRE standards repository alongside your project

**Config:**
```json
"filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "/home/you/sre-standards",
    "/home/you/shared-runbooks"
  ]
}
```

---

## SRE Workflow: Incident Triage with MCP

Here is an end-to-end example of using multiple MCP servers together during an incident.

**Scenario:** A PagerDuty alert fires — `payment-service` high error rate.

**Step 1 — Get alert context (PagerDuty MCP):**
> "What's the current status of the payment-service incident? Give me the full alert details."

**Step 2 — Check live metrics (AWS MCP):**
> "Pull CloudWatch metrics for payment-service-alb: 5xx rate, request count, and target response time for the last 30 minutes."

**Step 3 — Check application pods (Kubernetes MCP):**
> "List all pods in the payment namespace. Are any in a non-Running state? Show logs for the last 100 lines of any unhealthy pods."

**Step 4 — Check recent deploys (GitHub MCP):**
> "Were there any merges to the payment-service repo in the last 2 hours?"

**Step 5 — Synthesize:**
> "Based on everything you've found, what's the most likely root cause and what should I do first?"

This entire workflow — which would normally take 15–20 minutes of tab-switching and CLI commands — runs in Kiro in under 5 minutes.

---

## Security Considerations

- **Use read-only credentials.** MCP servers should have the minimum permissions needed — never admin or write access unless absolutely required.
- **Never commit API tokens.** Use `${env:VAR}` references in `.kiro/settings.json` and load them from your shell profile or a secrets manager.
- **Audit MCP tool calls.** Kiro shows every MCP call it makes in the activity panel — review them, especially in new workflows.
- **Keep MCP servers updated.** Servers are community-maintained packages — check for updates regularly.
- **Add `.kiro/settings.json` to `.gitignore`** if it contains environment-specific paths or token references, even indirect ones.
