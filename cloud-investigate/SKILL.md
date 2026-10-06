---
name: cloud-investigate
description: "Investigate cloud events, SQS queue health, CloudWatch logs, and infrastructure costs using scoped AWS CLI reads, Vantage, or available telemetry MCP tools. Use for event-delivery research or cloud-cost questions."
license: MIT
---

# Cloud investigate

Gather operational evidence that answers a specific question, then explain the observed path and the next useful check. This skill inspects systems; it does not deploy, replay, purge, resize, purchase, or change alerts.

## Inputs and boundary

Take the question, provider, account/profile, region/workspace, resource, and time window. Infer values from a supplied URL or repo config only when unambiguous; otherwise ask for the missing scope while tracing local code. Never assume a production account or deployment platform. Verify AWS account identity against the supplied account ID before resource reads.

Read [aws-and-costs.md](aws-and-costs.md) for the applicable mode. Use installed authenticated CLI/MCP tools and current official docs; do not install or reconfigure credentials automatically.

## AWS CLI

```bash
aws sts get-caller-identity --profile research-dev --region us-west-2 --output json --no-cli-pager
```

Use `aws` directly. Compare the returned `Account` with the intended account before any resource read; stop if identity fails or differs. Check the queue URL's account/region against the requested target. Use explicit `--profile`, `--region`, and `--no-cli-pager` on each command. [aws-and-costs.md](aws-and-costs.md) has native commands for SQS attributes/tags and a bounded CloudWatch log page. These examples use synthetic targets; replace them with the confirmed scope. If the target is unclear, show the proposed command while resolving scope. These reads have no native `--dry-run` flag.

For logs, start with an explicit UTC interval of at most 24 hours, a narrow filter, and one page. Use the CLI's `--query` projection to return event metadata without message bodies. Keep raw payloads local for inspection and redaction before using them in a prompt or artifact. Record errors and pagination tokens as evidence gaps.

## Investigation

1. Trace producer -> queue -> consumer -> downstream -> visible outcome from code/config. Identify event/correlation IDs, retry/idempotency rules, permissions, DLQ and tenant boundaries. Mark which parts are inferred.
2. Read scoped metadata/metrics/logs for the requested interval. SQS depth is approximate; current depth cannot prove what happened yesterday. Correlate log IDs/timestamps across boundaries and state exactly where observed execution stops.
3. Keep competing hypotheses and choose the next read that would distinguish them. A missing log, empty sample, permission error, or billing lag is not proof of no activity.
4. For cost questions, use Vantage or the named provider's cost tools. Confirm workspace/account, actual versus forecast, provider/service, date range, currency, granularity, allocation and data freshness. Link to the report/query and explain unit cost when denominators exist. Do not guess savings without workload evidence.
5. Return a sourced explanation with scope, observed facts, hypotheses/confidence, query coverage, and the next action. Make a visual report when useful; diagrams must distinguish observed and inferred transitions.

## SQS messages and stopping condition

ReceiveMessage is not a passive peek: it affects visibility and receive counts and can interact with DLQ redrive. Use attributes, tags, metrics and logs for ordinary investigation. If the user specifically requests message sampling, explain those effects and obtain authorization for the exact queue/action unless already given; then use a bounded CLI call. Zero visibility timeout does not make receiving side-effect free. Never delete, purge, replay, or acknowledge messages under a research request.

Finish once the question is answered with bounded evidence or the remaining gap is explicit. State what was queried and what was not verified. Review command examples against current official docs; do not test against live AWS or Vantage unless requested.
