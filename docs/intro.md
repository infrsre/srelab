---
id: intro
title: Introduction to Kiro for SRE
sidebar_label: Introduction
sidebar_position: 1
---

<div className="kiro-hero">
  <div className="kiro-hero__body">
    <span className="kiro-badge">SRE × AI — Built on AWS</span>
    <h1 className="kiro-hero__title">
      Ship reliability faster<br/>with <span className="kiro-hero__brand">Kiro</span>
    </h1>
    <p className="kiro-hero__sub">
      An AI-powered IDE that turns your intent into structured, reviewable SRE work —
      runbooks, IaC, monitoring configs, and automation scripts.
      Delegate to the agent; stay in control of every diff.
    </p>
    <div className="kiro-hero__cta">
      <a href="specs" className="kiro-cta-primary">Get started with Specs →</a>
      <a href="comparison" className="kiro-cta-ghost">Kiro vs Claude Code</a>
    </div>
  </div>
</div>

## How Kiro Works

<div className="kiro-flow">
  <div className="kiro-flow-step">
    <div className="kiro-flow-step__icon">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <line x1="8" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="16" x2="11" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="kiro-flow-step__num">01</div>
    <strong>Write Spec</strong>
    <p>Define requirements, design &amp; tasks in <code>.kiro/specs/</code></p>
  </div>

  <div className="kiro-flow-arrow">›</div>

  <div className="kiro-flow-step">
    <div className="kiro-flow-step__icon">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <line x1="12" y1="3" x2="12" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="3" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="18" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="kiro-flow-step__num">02</div>
    <strong>Kiro Plans</strong>
    <p>Kiro reads your intent and generates a task-by-task execution plan</p>
  </div>

  <div className="kiro-flow-arrow">›</div>

  <div className="kiro-flow-step kiro-flow-step--active">
    <div className="kiro-flow-step__icon">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="currentColor"/>
      </svg>
    </div>
    <div className="kiro-flow-step__num">03</div>
    <strong>Agent Executes</strong>
    <p>Writes files, runs tools, and invokes MCP connections autonomously</p>
  </div>

  <div className="kiro-flow-arrow">›</div>

  <div className="kiro-flow-step">
    <div className="kiro-flow-step__icon">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <polyline points="8,12 11,15 16,9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className="kiro-flow-step__num">04</div>
    <strong>Review Diff</strong>
    <p>Every change surfaces as a diff — accept, reject, or iterate</p>
  </div>

  <div className="kiro-flow-arrow">›</div>

  <div className="kiro-flow-step">
    <div className="kiro-flow-step__icon">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <line x1="2" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="15" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="kiro-flow-step__num">05</div>
    <strong>Commit &amp; Ship</strong>
    <p>Accepted changes are on disk, ready to commit and deploy normally</p>
  </div>
</div>

<div className="kiro-chips-row">
  <span className="kiro-chip">⚡ Hooks auto-fire on file events</span>
  <span className="kiro-chip">🔌 MCP connects live infrastructure</span>
  <span className="kiro-chip">🎯 Steering shapes every agent output</span>
</div>

---

## The Four Pillars

<div className="kiro-pillars">
  <a href="specs" className="kiro-pillar">
    <div className="kiro-pillar__icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <line x1="8" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="16" x2="11" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="kiro-pillar__content">
      <div className="kiro-pillar__title">Specs</div>
      <div className="kiro-pillar__desc">Define what to build. Requirements, design, and ordered tasks in one reviewable Markdown document.</div>
    </div>
    <div className="kiro-pillar__arrow">›</div>
  </a>

  <a href="agent-hooks" className="kiro-pillar">
    <div className="kiro-pillar__icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className="kiro-pillar__content">
      <div className="kiro-pillar__title">Agent Hooks</div>
      <div className="kiro-pillar__desc">Automate when the agent fires. Event-driven triggers that react to file saves, git events, and more.</div>
    </div>
    <div className="kiro-pillar__arrow">›</div>
  </a>

  <a href="steering-skills" className="kiro-pillar">
    <div className="kiro-pillar__icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="2" x2="12" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="15" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="2" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="15" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="kiro-pillar__content">
      <div className="kiro-pillar__title">Steering &amp; Skills</div>
      <div className="kiro-pillar__desc">Shape how the agent behaves. Custom context files and reusable slash-command workflows for your whole team.</div>
    </div>
    <div className="kiro-pillar__arrow">›</div>
  </a>

  <a href="mcp" className="kiro-pillar">
    <div className="kiro-pillar__icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
        <circle cx="5" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
        <circle cx="19" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="8" x2="5" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="8" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="kiro-pillar__content">
      <div className="kiro-pillar__title">MCP</div>
      <div className="kiro-pillar__desc">Connect the agent to live data. AWS, Kubernetes, PagerDuty, GitHub — all queryable from within any spec or chat.</div>
    </div>
    <div className="kiro-pillar__arrow">›</div>
  </a>
</div>

---

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

## Kiro vs Chat AI

<div className="kiro-compare">
  <div className="kiro-compare__col kiro-compare__col--muted">
    <div className="kiro-compare__label">Chat AI (Claude, ChatGPT…)</div>
    <div className="kiro-compare__flow">
      <span className="kiro-compare__node">You ask</span>
      <span className="kiro-compare__sep">→</span>
      <span className="kiro-compare__node">It answers</span>
      <span className="kiro-compare__sep">→</span>
      <span className="kiro-compare__node">You copy-paste</span>
      <span className="kiro-compare__sep">→</span>
      <span className="kiro-compare__node">You verify</span>
    </div>
    <p className="kiro-compare__note">Manual integration at every step. Context is lost between sessions.</p>
  </div>
  <div className="kiro-compare__col kiro-compare__col--active">
    <div className="kiro-compare__label">Kiro</div>
    <div className="kiro-compare__flow">
      <span className="kiro-compare__node">Write spec</span>
      <span className="kiro-compare__sep">→</span>
      <span className="kiro-compare__node">Kiro plans</span>
      <span className="kiro-compare__sep">→</span>
      <span className="kiro-compare__node">Agent executes</span>
      <span className="kiro-compare__sep">→</span>
      <span className="kiro-compare__node">Review diff</span>
    </div>
    <p className="kiro-compare__note">Hooks fire automatically. Steering carries org context. MCP connects real infra.</p>
  </div>
</div>

Kiro is less "ask and paste" and more **"delegate and review."**

## Who This Guide Is For

- **SRE engineers** new to Kiro who want hands-on guidance with real SRE scenarios
- **Platform and DevOps engineers** evaluating Kiro for team adoption
- **Engineering leads** assessing Kiro as part of an AI tooling strategy

If you are comparing Kiro to Claude Code or other AI tools, see the [Kiro vs Claude Code](./comparison) page.

## Prerequisites

- Kiro installed ([download from kiro.dev](https://kiro.dev))
- A project repository open in Kiro (any language)
- Basic familiarity with your team's infrastructure stack (AWS, Kubernetes, Terraform, etc.)

No prior AI tooling experience is required.
