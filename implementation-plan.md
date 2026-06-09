# Implementation Plan — Kiro SRE Guide

**Goal:** Live documentation site with CI/CD, ready for leadership sign-off by end of June 2026.
**Owner:** Solo (SRE team lead)
**Stack:** Docusaurus → GitLab Pages → AWS S3 + CloudFront (post-POC)

---

## Phase Overview

| Phase | Name | Target | Status |
|-------|------|--------|--------|
| 1 | Local Build & Validation | Jun 10, 2026 | In Progress |
| 2 | GitLab Deploy & Pipeline | Jun 13, 2026 | Not Started |
| 3 | Content Review & Polish | Jun 20, 2026 | Not Started |
| 4 | Leadership Presentation | Jun 30, 2026 | Not Started |
| 5 | AWS Migration (post-POC) | Post sign-off | Deferred |

---

## Phase 1 — Local Build & Validation
**Target: Jun 10, 2026**

Get the site running locally and confirm the build is clean before any code is pushed.

### Tasks
- [x] Scaffold Docusaurus project (`package.json`, `docusaurus.config.js`, `sidebars.js`)
- [x] Create all 7 tutorial pages (`docs/`)
- [x] Create CI/CD pipeline (`.gitlab-ci.yml`)
- [x] Create `.gitignore`
- [ ] `npm install` completes without errors
- [ ] `npm run build` produces a clean `build/` folder
- [ ] `npm start` — site loads at `localhost:3000`, all pages render
- [ ] Sidebar order is correct (intro → specs → hooks → steering → mcp → comparison → best practices)
- [ ] All internal doc links resolve (no broken link errors in build output)
- [ ] Replace placeholder logo (`static/img/logo.svg`) with org logo

### Definition of Done
Local dev server runs, build is error-free, all 7 pages are reachable.

---

## Phase 2 — GitLab Deploy & CI/CD Pipeline
**Target: Jun 13, 2026**

Get the site live on GitLab Pages via the automated pipeline.

### Tasks
- [ ] Confirm GitLab repo name and namespace (needed for `baseUrl` in `docusaurus.config.js`)
- [ ] Update `docusaurus.config.js` — set real `url` and `baseUrl` to match GitLab Pages URL
- [ ] Initialize git in `d:\launchpad\` (if not already done) and add GitLab remote
- [ ] Commit all files and push to `main`
- [ ] Verify pipeline triggers in GitLab CI/CD → Pipelines
- [ ] Confirm pipeline passes all 3 stages: install → build → pages deploy
- [ ] Open the live GitLab Pages URL and confirm the site loads
- [ ] Test: push a small content change → confirm pipeline auto-deploys within ~2 minutes
- [ ] Record the live URL in `project-scope.md` (resolve the last open question)

### Pipeline Stages Reminder
```
install → build (artifacts: build/) → pages (mv build public → artifacts: public/)
```

### Definition of Done
Any push to `main` automatically deploys to GitLab Pages. URL is stable and shareable.

---

## Phase 3 — Content Review & Polish
**Target: Jun 20, 2026**

Elevate the content from "accurate" to "presentation-ready." This phase is about quality, not new pages.

### Tasks

**Content accuracy**
- [ ] Walk through every code example and verify it runs (spec YAML, hook YAML, CI config)
- [ ] Replace any generic placeholder names (e.g., `acme`, `your-namespace`) with real org names/conventions
- [ ] Add at least one real SRE scenario per page drawn from actual team incidents or workflows
- [ ] Verify MCP server versions (`awslabs.aws-mcp-server`, Kubernetes server) are current

**Presentation quality**
- [ ] Read every page aloud — cut anything a new reader would find confusing
- [ ] Ensure intro page clearly answers "why should I care?" for a leadership audience
- [ ] Add an `:::tip` or `:::note` callout box on at least the Specs and Hooks pages (Docusaurus admonition syntax)
- [ ] Confirm dark mode and light mode both look correct
- [ ] Check mobile layout (leadership may open the link on a phone)

**Navigation**
- [ ] Confirm footer links all resolve
- [ ] Confirm navbar "Kiro Docs" external link works
- [ ] Add a "Edit this page" link if the GitLab repo is accessible to the broader team (optional)

### Definition of Done
Site reviewed end-to-end. No placeholder content. No broken examples. Readable by someone unfamiliar with the project.

---

## Phase 4 — Leadership Presentation
**Target: Jun 30, 2026**

Deliver the POC, get sign-off, and document outcomes.

### Tasks

**Prep**
- [ ] Prepare a 10-minute walkthrough script:
  1. Problem statement (1 min)
  2. Live site demo — navigate all 7 pages (5 min)
  3. Show the CI/CD pipeline auto-deploy (2 min)
  4. Ask for sign-off and discuss next steps (2 min)
- [ ] Confirm all success criteria from `project-scope.md` are met before the meeting
- [ ] Send the GitLab Pages URL to stakeholders at least 24 hours before the meeting

**Presentation day**
- [ ] Demo from the live URL — not localhost
- [ ] Have a fallback screenshot deck in case of network issues

**Post-presentation**
- [ ] Record outcome (sign-off received / feedback / follow-up actions)
- [ ] Update `project-scope.md` success criteria checkboxes
- [ ] Share the site URL in the relevant Slack channels for broader team adoption
- [ ] Identify the first non-SRE team to onboard using the guide

### Definition of Done
Leadership sign-off received. URL shared org-wide. At least one team directed to the guide.

---

## Phase 5 — AWS Migration (Post-POC)
**Target: Post sign-off (TBD)**

Migrate from GitLab Pages to AWS S3 + CloudFront for production-grade hosting.

### Tasks

**Infrastructure**
- [ ] Create Terraform module: `modules/static-site/` (S3 bucket + CloudFront + ACM cert)
- [ ] Apply to a new `sre-kiro-guide` S3 bucket with static website hosting enabled
- [ ] Configure CloudFront distribution with HTTPS and custom domain
- [ ] Update DNS to point custom domain to CloudFront

**CI/CD Update**
- [ ] Add AWS credentials to GitLab CI/CD variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, `CF_DISTRIBUTION_ID`)
- [ ] Add `deploy-aws` stage to `.gitlab-ci.yml`:
  ```yaml
  deploy-aws:
    stage: deploy-aws
    script:
      - aws s3 sync build/ s3://$S3_BUCKET --delete
      - aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths "/*"
    rules:
      - if: $CI_COMMIT_BRANCH == "main"
  ```
- [ ] Test full pipeline: push → build → S3 sync → CloudFront invalidation
- [ ] Deprecate GitLab Pages deployment (or keep as fallback)

**Comms**
- [ ] Announce new URL to all teams currently using the site
- [ ] Update any bookmarks or Slack channel pins

### Definition of Done
Site served from CloudFront with custom domain and HTTPS. GitLab CI/CD handles S3 sync + cache invalidation on every push to `main`.

---

## Risk & Mitigation

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| GitLab Pages URL not matching `baseUrl` in config | High | Confirm repo name before first push; update config before going live |
| Leadership presentation delayed past June 30 | Medium | Site is live regardless — presentation is the milestone, not a blocker |
| Content becomes stale post-launch | Medium | Set up a quarterly review reminder; hooks + skills pages especially |
| npm/Node version mismatch in CI | Low | CI uses `node:20-alpine`; local is Node 24 — test build locally before first push |

---

## Quick Reference — Key Commands

```bash
# Local development
npm start                    # dev server at localhost:3000

# Build check (run before every push)
npm run build                # outputs to build/

# Clear Docusaurus cache if things look wrong
npm run clear && npm run build
```
