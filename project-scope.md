# SRE POC Website — Project Scope

## Problem

SRE teams need practical, accessible guidance on applying Kiro to real support challenges (analysis, troubleshooting, automation). Without a centralized resource:
- High-value scenarios cannot be identified and scaled across teams
- Onboarding new adopters requires repeated manual effort
- Best practices, configurations, and setup guidelines remain undocumented and siloed

## Goal

Build a documentation website that serves as the SRE team's Kiro knowledge hub — enabling org-wide adoption and providing leadership with a visible, measurable POC deliverable.

## Audience

- **Primary:** SRE team (authors and primary users)
- **Secondary:** Other engineering teams adopting Kiro
- **Stakeholder:** Leadership — site must demonstrate value and polish for sign-off

## Success Criteria

- [ ] Leadership presentation delivered and sign-off received
- [ ] All four core Kiro topics documented with real SRE examples
- [ ] CI/CD pipeline functional: commits to `main` auto-deploy to GitLab Pages
- [ ] At least one non-SRE team directed to the site for onboarding

## Solution

A Docusaurus-based documentation site hosted on GitLab Pages, with a GitLab CI/CD pipeline. AWS (S3 + CloudFront) is the target production environment — deferred post-POC.

## Content Structure

### Pages / Sections

| Page | Description | Status |
|------|-------------|--------|
| Home / Intro | What Kiro is, why SRE uses it, how to navigate the guide | Done — `docs/intro.md` |
| Specs | How to write Kiro specs — step-by-step with SRE examples | Done — `docs/specs.md` |
| Agent Hooks | Hook configuration, event types, SRE automation use cases | Done — `docs/agent-hooks.md` |
| Agent Steering & Skills | Steering files, custom skills, best practices | Done — `docs/steering-skills.md` |
| MCP (Model Context Protocol) | MCP setup, available servers, SRE integrations | Done — `docs/mcp.md` |
| Kiro vs Claude Code | When to use each — comparison of IDE, terminal, and agent workflows | Done — `docs/comparison.md` |
| Best Practices | Standard configurations, setup guidelines, lessons learned | Done — `docs/best-practices.md` |

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Docusaurus | Markdown-based, built-in search, React extensible |
| Hosting (POC) | GitLab Pages | Free, fast to set up, integrated with CI/CD |
| Hosting (Post-POC) | AWS S3 + CloudFront | Static site CDN — migrate after leadership sign-off |
| CI/CD | GitLab CI/CD | Build and deploy pipeline on push to `main` |
| Version Control | GitLab | Source of truth |

## CI/CD Pipeline Stages

1. **Install** — `npm install`
2. **Build** — `npm run build` (Docusaurus static output)
3. **Deploy** — Push `build/` to GitLab Pages
4. **Future:** Add staging environment, link checker, and AWS deploy stage post-POC

## Out of Scope (POC)

- Authentication / access control (public site for now)
- Search beyond Docusaurus built-in
- Interactive demos or embedded tooling
- AWS infrastructure (post-POC)
- Localization / multi-language

## Open Questions

- [x] **Timeline:** Leadership presentation target — end of June 2026
- [x] **Content ownership:** Solo author
- [x] **Kiro content readiness:** All four topics (Specs, Hooks, Skills, MCP) drafted — see `docs/`
- [x] **GitLab repo:** Already exists
- [ ] **Domain / URL:** GitLab Pages default URL or custom internal domain — confirm with team
- [x] **Branding:** Minimal — add org logo to Docusaurus, keep default theme

## Milestones

| Milestone | Description | Target Date |
|-----------|-------------|-------------|
| M1 | Repo created, Docusaurus scaffolded, CI/CD deploys to GitLab Pages | ASAP |
| M2 | First two content sections drafted and published | Mid-June 2026 |
| M3 | All content sections complete | June 20, 2026 |
| M4 | Leadership review and sign-off | End of June 2026 |
| M5 | AWS migration (post-POC) | Post sign-off |
