---
id: tutorial-first-spec
title: "Tutorial: Build an Incident Automation Bot with Kiro"
sidebar_label: "Tutorial: Incident Bot"
sidebar_position: 2
---

# Tutorial: Build an Incident Automation Bot with Kiro

<div className="page-intro">
  <div className="page-intro__icon">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  </div>
  <div>
    <p className="page-intro__desc">
      Build a real automation project from scratch — a Lambda function that receives PagerDuty alerts
      and posts structured incident messages to Microsoft Teams, complete with Terraform infrastructure and CI/CD.
      Kiro writes every file. You review every diff.
    </p>
    <div className="page-intro__tags">
      <span className="pi-tag">~25 min</span>
      <span className="pi-tag">Beginner</span>
      <span className="pi-tag">Python · AWS Lambda</span>
      <span className="pi-tag">Full project</span>
    </div>
  </div>
</div>

## The Problem

Every time PagerDuty fires an alert, your on-call engineer manually:

1. Opens PagerDuty to read the alert title and severity
2. Finds the right Teams channel
3. Writes an incident message by hand
4. Pastes the runbook link from the wiki
5. Tags the affected service team

That's 3–5 minutes of cognitive overhead at 2 AM. Multiply by 40 incidents a month and it's a real problem.

**Your goal:** Build a bot that does all of this automatically.

<div className="tutorial-outcome">
  <div className="tutorial-outcome__icon">📦</div>
  <div>
    <strong>What you'll build:</strong> A Python AWS Lambda function behind an API Gateway that receives PagerDuty webhooks,
    formats a rich Teams message card with severity badge, service name, on-call engineer, and runbook link,
    and posts it to the <code>incidents</code> Teams channel — all deployed via Terraform and a GitHub Actions pipeline.
  </div>
</div>

### The file tree Kiro will produce

```
incident-bot/
├── src/
│   ├── handler.py        ← Lambda entry point
│   ├── pagerduty.py      ← Webhook parser and event models
│   ├── teams.py          ← Message formatter and Teams webhook client
│   └── runbooks.py       ← Runbook URL resolver by service name
├── tests/
│   ├── test_handler.py
│   ├── test_slack.py
│   └── fixtures/
│       └── pagerduty_trigger.json   ← Sample webhook payload
├── terraform/
│   ├── main.tf           ← Lambda + API Gateway
│   ├── iam.tf            ← Lambda execution role
│   ├── variables.tf
│   └── outputs.tf
├── .github/
│   └── workflows/
│       └── deploy.yml    ← Build → Test → Terraform apply
└── requirements.txt
```

You will write **none of this manually**. You write the spec; Kiro writes the code.

---

## Before You Start

You need:
- **Kiro installed** — [kiro.dev](https://kiro.dev)
- **An empty repo** open in Kiro (create `incident-bot/` and open it)
- **A Teams Incoming Webhook URL** — in Teams, go to the **incidents** channel → **⋯ → Connectors → Incoming Webhook → Configure** → copy the URL
- **Basic Python familiarity** — you don't need to write any, but reviewing the diffs will be easier

:::tip No AWS account yet?
You can still follow this tutorial. Kiro will write all the code and Terraform. You just won't run the `terraform apply` step at the end. Everything up to that point is local.
:::

---

## Step 1 — Create the Spec

Open Kiro's command palette: **`Cmd/Ctrl + Shift + P`** → type **`Kiro: New Spec`** → name it `incident-slack-bot`.

Kiro creates `.kiro/specs/incident-slack-bot.md` and opens it.

---

## Step 2 — Write the Requirements

Copy this into the Requirements section of your spec:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">.kiro/specs/incident-slack-bot.md</span>
  </div>
  <div className="ide-window__body ide-window__body--code">

```markdown
## Requirements

- As an on-call SRE, I need PagerDuty alerts automatically posted to Microsoft Teams
  so that the whole team is aware of incidents without anyone having to
  manually copy-paste from PagerDuty.

- When a PagerDuty "trigger" event fires, post a MessageCard to the incidents
  Teams channel containing:
    - Severity badge (P1/P2/P3/P4 with color coding via themeColor)
    - Incident title from PagerDuty
    - Affected service name
    - On-call engineer's name
    - Runbook URL (looked up by service name from a YAML config)
    - Link back to the PagerDuty incident

- When a PagerDuty "resolve" event fires, post a "✅ Resolved" follow-up
  to the same Teams channel referencing the original incident title.

- The bot must be a Python AWS Lambda function triggered by API Gateway.
- Secrets (Teams webhook URL, PagerDuty signing secret) must come from
  AWS SSM Parameter Store — never hardcoded.
- All errors must be logged to CloudWatch and must not crash the Lambda
  (return HTTP 200 to PagerDuty even on soft errors so it stops retrying).
```

  </div>
</div>

:::info Why mention "never hardcoded" in Requirements?
Kiro reads your Requirements to understand constraints, not just features.
Saying "secrets must come from SSM" tells Kiro to use `boto3` SSM calls
rather than `os.environ` — a meaningful architectural difference it would
otherwise guess at.
:::

---

## Step 3 — Write the Design

Add this Design section below Requirements:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">.kiro/specs/incident-slack-bot.md</span>
  </div>
  <div className="ide-window__body ide-window__body--code">

```markdown
## Design

### Project layout
- src/handler.py      — Lambda entry: validates signature, routes to trigger/resolve handlers
- src/pagerduty.py    — Dataclass models for PagerDuty webhook payload, HMAC signature validation
- src/teams.py        — TeamsClient class + build_card() using Teams MessageCard format
- src/runbooks.py     — load runbooks.yaml and return URL for a given service name
- tests/              — pytest, one file per module, fixtures in tests/fixtures/
- terraform/          — Lambda + API Gateway HTTP API (not REST API), SSM reads via data sources

### Python details
- Python 3.12, no framework (plain Lambda handler, no FastAPI/Flask)
- Use dataclasses for PagerDuty event models
- Teams MessageCard format (@type: MessageCard, themeColor, sections with facts, potentialAction)
- Severity color map: P1=#FF0000, P2=#FF8C00, P3=#FFC200, P4=#36A64F
- runbooks.yaml lives at the project root, keyed by service name:
    payments-api: https://wiki.internal/runbooks/payments-api
    auth-service: https://wiki.internal/runbooks/auth-service

### Terraform details
- AWS Lambda (zip deployment from src/ + requirements.txt)
- API Gateway HTTP API with a single POST /webhook route → Lambda integration
- IAM role: AWSLambdaBasicExecutionRole + ssm:GetParameter for /incident-bot/*
- Lambda env vars: SSM_SLACK_PARAM=/incident-bot/slack-webhook, SSM_PD_SECRET_PARAM=/incident-bot/pd-secret
- No VPC (public Lambda is fine for a webhook receiver)

### GitHub Actions
- On push to main: pip install → pytest → zip → terraform apply
- Terraform state in S3 backend (bucket name from GitHub secret TF_STATE_BUCKET)
```

  </div>
</div>

---

## Step 4 — Generate Tasks

Click **Generate Tasks** in the Kiro sidebar. Kiro reads both sections and produces:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">Generated Tasks</span>
  </div>
  <div className="ide-window__body ide-window__body--code">

```markdown
## Tasks

- [ ] 1. Create `requirements.txt` (boto3, pytest, requests)
- [ ] 2. Create `src/pagerduty.py` — PagerDutyEvent dataclass + validate_signature()
- [ ] 3. Create `src/runbooks.py` — load_runbooks() from runbooks.yaml
- [ ] 4. Create `runbooks.yaml` with payments-api and auth-service entries
- [ ] 5. Create `src/teams.py` — TeamsClient class, build_card() with Teams MessageCard format
- [ ] 6. Create `src/handler.py` — Lambda entry point, route trigger vs resolve events
- [ ] 7. Create `tests/fixtures/pagerduty_trigger.json` — realistic sample webhook payload
- [ ] 8. Create `tests/test_handler.py` — test trigger and resolve paths, mock SSM + Teams
- [ ] 9. Create `tests/test_teams.py` — test MessageCard structure and severity colors
- [ ] 10. Create `terraform/variables.tf`
- [ ] 11. Create `terraform/iam.tf` — Lambda execution role with SSM permissions
- [ ] 12. Create `terraform/main.tf` — Lambda + API Gateway HTTP API
- [ ] 13. Create `terraform/outputs.tf` — webhook_url output
- [ ] 14. Create `.github/workflows/deploy.yml` — test + terraform apply pipeline
```

  </div>
</div>

14 tasks across Python, tests, Terraform, and CI/CD — generated in about 10 seconds.

Scan the list. If a task is missing (e.g., you want a `Makefile`), add it now. When ready, click **Run Spec**.

---

## Step 5 — Watch the Agent Build It

The Kiro Agent panel shows live progress. Each task takes 20–40 seconds:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">Kiro Agent — incident-slack-bot</span>
  </div>
  <div className="ide-window__body">
    <div className="agent-log">
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>Task 1 — Created <code>requirements.txt</code></span>
      </div>
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>Task 2 — Created <code>src/pagerduty.py</code> with HMAC validation</span>
      </div>
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>Task 3–4 — Created <code>src/runbooks.py</code> + <code>runbooks.yaml</code></span>
      </div>
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>Task 5 — Created <code>src/slack.py</code> with Block Kit builder</span>
      </div>
      <div className="agent-log__line agent-log__line--active">
        <span className="agent-log__status agent-log__status--spin">◌</span>
        <span>Task 6 — Writing <code>src/handler.py</code> — Lambda entry point...</span>
      </div>
      <div className="agent-log__line agent-log__line--pending">
        <span className="agent-log__status">○</span>
        <span>Tasks 7–9 — Tests + fixtures</span>
      </div>
      <div className="agent-log__line agent-log__line--pending">
        <span className="agent-log__status">○</span>
        <span>Tasks 10–13 — Terraform</span>
      </div>
      <div className="agent-log__line agent-log__line--pending">
        <span className="agent-log__status">○</span>
        <span>Task 14 — GitHub Actions</span>
      </div>
    </div>
  </div>
</div>

You don't touch the keyboard. Kiro is reading your spec, reasoning about each file's dependencies, and generating in order (it writes `pagerduty.py` before `handler.py` because `handler.py` imports it).

---

## Step 6 — Review the Python Code

When Task 6 completes, Kiro shows you the `handler.py` diff. This is the most important file — read it carefully:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">Diff — src/handler.py</span>
  </div>
  <div className="ide-window__body ide-window__body--diff">

```diff
+ import json
+ import logging
+ import boto3
+ from pagerduty import PagerDutyEvent, validate_signature
+ from teams import TeamsClient
+ from runbooks import load_runbooks
+
+ logger = logging.getLogger()
+ logger.setLevel(logging.INFO)
+
+ ssm = boto3.client("ssm")
+
+ def _get_param(name: str) -> str:
+     return ssm.get_parameter(Name=name, WithDecryption=True)["Parameter"]["Value"]
+
+ def lambda_handler(event: dict, context) -> dict:
+     try:
+         body = event.get("body", "")
+         signature = event.get("headers", {}).get("x-pagerduty-signature", "")
+         pd_secret  = _get_param(os.environ["SSM_PD_SECRET_PARAM"])
+
+         if not validate_signature(body, signature, pd_secret):
+             logger.warning("Invalid PagerDuty signature — ignoring request")
+             return {"statusCode": 200, "body": "ignored"}
+
+         payload = json.loads(body)
+         pd_event = PagerDutyEvent.from_webhook(payload)
+         teams_webhook = _get_param(os.environ["SSM_TEAMS_PARAM"])
+         runbooks = load_runbooks()
+         client = TeamsClient(teams_webhook)
+
+         if pd_event.event_type == "trigger":
+             runbook_url = runbooks.get(pd_event.service, "https://wiki.internal/runbooks")
+             client.post_incident(pd_event, runbook_url)
+             logger.info(f"Posted incident: {pd_event.incident_id}")
+
+         elif pd_event.event_type == "resolve":
+             client.post_resolved(pd_event)
+             logger.info(f"Posted resolve: {pd_event.incident_id}")
+
+     except Exception as e:
+         logger.error(f"Unhandled error: {e}", exc_info=True)
+
+     # Always return 200 — PagerDuty retries on non-2xx
+     return {"statusCode": 200, "body": "ok"}
```

  </div>
</div>

**What to check in this diff:**

<div className="review-checklist">
  <div className="review-checklist__item review-checklist__item--good">
    <span>✓</span>
    <span>Signature validation happens before processing — correct security order</span>
  </div>
  <div className="review-checklist__item review-checklist__item--good">
    <span>✓</span>
    <span>Exceptions are caught and logged but never re-raised — Lambda always returns 200 as required</span>
  </div>
  <div className="review-checklist__item review-checklist__item--good">
    <span>✓</span>
    <span>SSM calls use <code>WithDecryption=True</code> — correct for SecureString params</span>
  </div>
  <div className="review-checklist__item review-checklist__item--warn">
    <span>⚠</span>
    <span>Missing <code>import os</code> — Kiro occasionally misses an import. Edit it inline before accepting.</span>
  </div>
</div>

Click **Edit then Accept**, add `import os` on line 2, then accept.

Now review `src/slack.py` — the Block Kit message builder:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">Diff — src/teams.py</span>
  </div>
  <div className="ide-window__body ide-window__body--diff">

```diff
+ import json
+ import urllib.request
+ from dataclasses import dataclass
+ from pagerduty import PagerDutyEvent
+
+ SEVERITY_COLORS = {
+     "P1": "#FF0000",
+     "P2": "#FF8C00",
+     "P3": "#FFC200",
+     "P4": "#36A64F",
+ }
+
+ @dataclass
+ class TeamsClient:
+     webhook_url: str
+
+     def _post(self, payload: dict) -> None:
+         data = json.dumps(payload).encode("utf-8")
+         req = urllib.request.Request(
+             self.webhook_url,
+             data=data,
+             headers={"Content-Type": "application/json"},
+         )
+         urllib.request.urlopen(req, timeout=5)
+
+     def post_incident(self, event: PagerDutyEvent, runbook_url: str) -> None:
+         color = SEVERITY_COLORS.get(event.severity, "#CCCCCC")
+         payload = {
+             "@type": "MessageCard",
+             "@context": "http://schema.org/extensions",
+             "themeColor": color,
+             "summary": f"{event.severity} — {event.title}",
+             "sections": [{
+                 "activityTitle": f"🚨 **{event.severity}** — {event.title}",
+                 "activitySubtitle": f"Service: **{event.service}**",
+                 "facts": [
+                     {"name": "On-call",     "value": event.oncall_name},
+                     {"name": "Runbook",     "value": f"[Open runbook]({runbook_url})"},
+                     {"name": "Incident ID", "value": event.incident_id},
+                 ]
+             }],
+             "potentialAction": [{
+                 "@type": "OpenUri",
+                 "name": "View in PagerDuty",
+                 "targets": [{"os": "default", "uri": event.html_url}]
+             }]
+         }
+         self._post(payload)
+
+     def post_resolved(self, event: PagerDutyEvent) -> None:
+         payload = {
+             "@type": "MessageCard",
+             "@context": "http://schema.org/extensions",
+             "themeColor": "#36A64F",
+             "summary": f"Resolved — {event.title}",
+             "text": f"✅ **Resolved** — {event.title} (`{event.incident_id}`)",
+         }
+         self._post(payload)
```

  </div>
</div>

This is production-quality Teams MessageCard code using only stdlib (`urllib.request`) — no `requests` dependency needed. Accept it.

---

## Step 7 — Review the Terraform

After the Python files, Kiro generates the infrastructure. Review `terraform/main.tf`:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">Diff — terraform/main.tf</span>
  </div>
  <div className="ide-window__body ide-window__body--diff">

```diff
+ data "archive_file" "lambda_zip" {
+   type        = "zip"
+   source_dir  = "${path.module}/../src"
+   output_path = "${path.module}/lambda.zip"
+ }
+
+ resource "aws_lambda_function" "incident_bot" {
+   filename         = data.archive_file.lambda_zip.output_path
+   source_code_hash = data.archive_file.lambda_zip.output_base64sha256
+   function_name    = "${var.environment}-incident-bot"
+   role             = aws_iam_role.lambda_exec.arn
+   handler          = "handler.lambda_handler"
+   runtime          = "python3.12"
+   timeout          = 30
+
+   environment {
+     variables = {
+       SSM_TEAMS_PARAM     = "/incident-bot/teams-webhook"
+       SSM_PD_SECRET_PARAM = "/incident-bot/pd-secret"
+     }
+   }
+ }
+
+ resource "aws_apigatewayv2_api" "webhook" {
+   name          = "${var.environment}-incident-bot-api"
+   protocol_type = "HTTP"
+ }
+
+ resource "aws_apigatewayv2_integration" "lambda" {
+   api_id             = aws_apigatewayv2_api.webhook.id
+   integration_type   = "AWS_PROXY"
+   integration_uri    = aws_lambda_function.incident_bot.invoke_arn
+   payload_format_version = "2.0"
+ }
+
+ resource "aws_apigatewayv2_route" "webhook" {
+   api_id    = aws_apigatewayv2_api.webhook.id
+   route_key = "POST /webhook"
+   target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
+ }
+
+ resource "aws_apigatewayv2_stage" "default" {
+   api_id      = aws_apigatewayv2_api.webhook.id
+   name        = "$default"
+   auto_deploy = true
+ }
```

  </div>
</div>

Notice Kiro used **API Gateway HTTP API** (v2), not the older REST API — because you said so in the Design section. It also set `payload_format_version = "2.0"` which is required for the Lambda event format to match what `handler.py` expects. Accept it.

---

## Step 8 — Add a Hook: Auto-Test on Python Save

You don't want to wait until CI to find out a Python file broke. Add a Kiro Hook that runs pytest every time you save a `.py` file.

Create `.kiro/hooks/auto-test.yaml`:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">.kiro/hooks/auto-test.yaml</span>
  </div>
  <div className="ide-window__body ide-window__body--code">

```yaml
name: Run Tests on Python Save
description: Runs pytest when any src/ file is saved, reports failures inline
trigger:
  type: file_save
  glob: "src/**/*.py"
instruction: |
  The file {{file_path}} was just saved.

  Run the test suite: `pytest tests/ -x -q`

  If tests pass: do nothing, just log "✓ tests passed" to .kiro/test-log.md
  with the timestamp and file that triggered the run.

  If tests fail: open the relevant test file, find the failing assertion,
  and add an inline comment above the assertion explaining what the failure
  means in plain English — so the developer understands the issue immediately
  without reading pytest output.
```

  </div>
</div>

From this point forward, every time Kiro writes a Python file (or you edit one), the tests run automatically. Failures surface as inline code comments — not buried in a terminal.

:::tip Hooks make Kiro a continuous collaborator
Without this hook, you'd finish all 14 tasks and then run tests — potentially finding 3 bugs at once. With this hook, bugs surface one file at a time as Kiro builds. This is the difference between a batch review and a live review.
:::

---

## Step 9 — Add Steering: Python & AWS Standards

You notice Kiro used `requests` for the Teams HTTP call. Your team policy is to use `urllib.request` (stdlib) directly in Lambdas to avoid adding a dependency. Add a steering file so Kiro follows this rule on every future spec.

Create `.kiro/steering/lambda-standards.md`:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">.kiro/steering/lambda-standards.md</span>
  </div>
  <div className="ide-window__body ide-window__body--code">

```markdown
# Lambda & Python Standards

## HTTP calls
- Do NOT use the `requests` library in Lambda functions.
- Use `urllib.request` (stdlib) for all HTTP calls including Teams webhooks.
- Reason: avoid adding packages that inflate the deployment zip.

## Secrets
- All secrets come from AWS SSM Parameter Store with WithDecryption=True.
- Never read secrets from environment variables directly.
- Cache SSM values at the module level (outside the handler) to avoid
  fetching on every invocation.

## Error handling
- Lambda handlers must NEVER raise exceptions.
- Catch all exceptions at the top level, log with logger.error(..., exc_info=True),
  and return {"statusCode": 200} so external services stop retrying.

## Logging
- Use structured logging: logger.info("event", extra={"incident_id": x, "service": y})
- Do not use print(). Use the logging module.

## Terraform
- All Lambda functions use python3.12 runtime.
- All resources are tagged: Environment, Service, ManagedBy=terraform, Team.
- Use HTTP API (apigatewayv2), not REST API (apigateway), for webhook endpoints.
```

  </div>
</div>

Now reject `src/teams.py` and click **Re-run Task** with the note: *"Use urllib.request instead of requests library"*. Kiro regenerates `teams.py` using only stdlib — matching your team standard.

---

## Step 10 — Test It Locally

All 14 tasks are accepted. Before pushing, run the tests:

```bash
pip install -r requirements.txt
pytest tests/ -v
```

Expected output:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">Terminal</span>
  </div>
  <div className="ide-window__body">
    <div className="agent-log">
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>tests/test_handler.py::test_trigger_posts_to_slack <strong style={{color:'#22c55e'}}>PASSED</strong></span>
      </div>
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>tests/test_handler.py::test_resolve_posts_resolved_message <strong style={{color:'#22c55e'}}>PASSED</strong></span>
      </div>
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>tests/test_handler.py::test_invalid_signature_returns_200 <strong style={{color:'#22c55e'}}>PASSED</strong></span>
      </div>
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>tests/test_slack.py::test_p1_uses_red_color <strong style={{color:'#22c55e'}}>PASSED</strong></span>
      </div>
      <div className="agent-log__line agent-log__line--done">
        <span className="agent-log__status">✓</span>
        <span>tests/test_slack.py::test_block_kit_has_runbook_link <strong style={{color:'#22c55e'}}>PASSED</strong></span>
      </div>
      <div className="agent-log__line" style={{marginTop: '0.5rem', fontWeight: 600, color: '#22c55e'}}>
        <span className="agent-log__status">✓</span>
        <span>5 passed in 0.42s</span>
      </div>
    </div>
  </div>
</div>

All green. Commit and push:

```bash
git add .
git commit -m "feat: incident-slack-bot via Kiro spec"
git push origin main
```

GitHub Actions picks it up, runs pytest, then runs `terraform apply`. After ~2 minutes, the output shows:

```
Outputs:
webhook_url = "https://abc123.execute-api.us-east-1.amazonaws.com/webhook"
```

---

## Step 11 — Wire Up PagerDuty

In PagerDuty:
1. Go to **Integrations → Generic Webhooks (V3)**
2. Add Webhook URL: paste the `webhook_url` from Terraform output
3. Events: check **Incident Triggered** and **Incident Resolved**
4. Save

Trigger a test incident in PagerDuty. Within 3 seconds, the **incidents** Teams channel shows:

<div className="ide-window">
  <div className="ide-window__bar">
    <span className="ide-window__dot ide-window__dot--red"></span>
    <span className="ide-window__dot ide-window__dot--yellow"></span>
    <span className="ide-window__dot ide-window__dot--green"></span>
    <span className="ide-window__title">incidents — Microsoft Teams</span>
  </div>
  <div className="ide-window__body">
    <div className="slack-message">
      <div className="slack-message__bar slack-message__bar--red"></div>
      <div className="slack-message__content">
        <div className="slack-message__header">🚨 P2 — payments-api high error rate</div>
        <div className="slack-message__fields">
          <div><strong>Service:</strong> payments-api</div>
          <div><strong>On-call:</strong> Alex Chen</div>
          <div><strong>Runbook:</strong> <span style={{color:'#7c3aed'}}>Open runbook ↗</span></div>
          <div><strong>Incident ID:</strong> P123ABC</div>
        </div>
        <div className="slack-message__button">View in PagerDuty</div>
      </div>
    </div>
  </div>
</div>

<div className="tutorial-outcome">
  <div className="tutorial-outcome__icon">🎉</div>
  <div>
    <strong>Shipped.</strong> You went from an empty folder to a production Lambda bot with tests,
    Terraform, and CI/CD — without writing a single file by hand.
    The spec took 5 minutes to write. Kiro did the rest in under 10 minutes of agent execution.
  </div>
</div>

---

## What Made This Work

<div className="kiro-pillars" style={{marginTop: '1rem'}}>
  <div className="kiro-pillar" style={{cursor:'default'}}>
    <div className="kiro-pillar__icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    </div>
    <div className="kiro-pillar__content">
      <div className="kiro-pillar__title">Spec captured the full picture</div>
      <div className="kiro-pillar__desc">Requirements covered <em>why</em> (no manual copy-paste) and constraints (SSM, never crash). Design specified the exact file layout, API choices, and patterns — so Kiro had no ambiguity to resolve on its own.</div>
    </div>
  </div>
  <div className="kiro-pillar" style={{cursor:'default'}}>
    <div className="kiro-pillar__icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
    </div>
    <div className="kiro-pillar__content">
      <div className="kiro-pillar__title">Hook gave instant feedback</div>
      <div className="kiro-pillar__desc">The auto-test hook caught issues file-by-file as Kiro built, not as a batch at the end. Bugs surfaced with context, not as a wall of pytest errors.</div>
    </div>
  </div>
  <div className="kiro-pillar" style={{cursor:'default'}}>
    <div className="kiro-pillar__icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="2" x2="12" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="15" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    </div>
    <div className="kiro-pillar__content">
      <div className="kiro-pillar__title">Steering enforced team standards</div>
      <div className="kiro-pillar__desc">One rejected task + a steering file means every future Lambda in this repo will use <code>urllib.request</code>, cache SSM, and tag resources correctly — automatically.</div>
    </div>
  </div>
</div>

---

## Next Steps

- **Extend this bot** — Add an `Acknowledge` action button in the Teams card that calls back to PagerDuty's API to acknowledge the incident. Write a new spec: `incident-teams-bot-acknowledge`.
- **[Agent Hooks →](agent-hooks)** — Explore all hook trigger types and more automation patterns
- **[Steering & Skills →](steering-skills)** — Turn your Lambda standards into a reusable skill your team can invoke with `/deploy-lambda`
- **[MCP →](mcp)** — Connect Kiro to live AWS so it can query CloudWatch metrics and paste them directly into incident messages
