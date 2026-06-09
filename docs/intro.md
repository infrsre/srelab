---
id: intro
title: Introduction to Kiro for SRE
sidebar_label: Introduction
sidebar_position: 1
---

# Introduction to Kiro for SRE

## What is Kiro?

Kiro is an AI-powered IDE built by AWS that goes beyond code completion. Unlike traditional AI assistants that respond to single prompts, Kiro operates through **specification-driven development** — you define what you want built or automated, and Kiro executes it as a structured, traceable workflow.

For SRE teams, this means moving from manually writing runbooks, Terraform modules, and monitoring configs to describing your intent and letting Kiro generate, validate, and maintain them.

## Why SRE Teams Use Kiro

| Challenge | Without Kiro | With Kiro |
|-----------|-------------|-----------|
| Incident runbooks | Written manually, often outdated | Generated from specs, auto-updated via hooks |
| IaC authoring | Slow, error-prone, tribal knowledge | Spec-driven generation with best practices baked in |
| Log analysis | Manual grep and regex | Agent-assisted pattern detection with MCP integrations |
| Onboarding | Shadow shifts, wiki hunting | Guided by steered agents with org context |
| Repetitive automation | Bash scripts scattered in repos | Reusable skills invoked on demand |

## How Kiro Differs from a Chat AI

```
Chat AI (e.g., Claude, ChatGPT)
  └── You ask → It answers → You copy-paste → You verify

Kiro
  └── You write a spec → Kiro plans → Kiro executes → You review diffs
       └── Hooks trigger automatically on events
       └── Steering keeps the agent in your context
       └── MCP connects it to your real infrastructure
```

Kiro is less "ask and paste" and more "delegate and review."

## Core Concepts

This guide covers four pillars of Kiro, in the order you will encounter them:

1. **[Specs](./specs)** — Define what to build. Kiro's structured planning layer.
2. **[Agent Hooks](./agent-hooks)** — Automate when the agent fires. Event-driven triggers.
3. **[Agent Steering & Skills](./steering-skills)** — Shape how the agent behaves. Custom context and reusable capabilities.
4. **[MCP (Model Context Protocol)](./mcp)** — Connect the agent to your tools and data sources.

## Who This Guide Is For

- **SRE engineers** new to Kiro who want hands-on guidance with real SRE scenarios
- **Platform and DevOps engineers** evaluating Kiro for team adoption
- **Engineering leads** assessing Kiro as part of an AI tooling strategy

If you are comparing Kiro to Claude Code or other AI coding tools, see the [Kiro vs Claude Code](./comparison) page.

## Prerequisites

- Kiro installed ([download from kiro.dev](https://kiro.dev))
- This guide is hosted at [sreluger-group.gitlab.io/sreluger-project](https://sreluger-group.gitlab.io/sreluger-project/)
- A project repository open in Kiro (any language)
- Basic familiarity with your team's infrastructure stack (AWS, Kubernetes, Terraform, etc.)

No prior AI tooling experience is required.
