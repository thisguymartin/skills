# AWS and cost modes

## SQS and event delivery

Use queue attributes for current approximate depth/in-flight/delay, retention, visibility timeout and redrive policy. Use queue tags to confirm resource context. For historic behavior correlate producer/consumer logs and existing queue metrics in the named window. Queue metrics count operations and approximations; avoid presenting them as a unique-event audit trail.

First run `aws sts get-caller-identity` as shown in [SKILL.md](SKILL.md). Compare its `Account` with the intended account, then check the queue URL's account and region. Stop on a mismatch or failed identity lookup. After confirming the target, use native CLI reads:

```bash
aws sqs get-queue-attributes \
  --profile research-dev --region us-west-2 \
  --queue-url https://sqs.us-west-2.amazonaws.com/123456789012/synthetic-events \
  --attribute-names QueueArn ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible ApproximateNumberOfMessagesDelayed VisibilityTimeout MessageRetentionPeriod RedrivePolicy \
  --output json --no-cli-pager

aws sqs list-queue-tags \
  --profile research-dev --region us-west-2 \
  --queue-url https://sqs.us-west-2.amazonaws.com/123456789012/synthetic-events \
  --output json --no-cli-pager
```

The commands do not enforce the account comparison for you; the agent must inspect identity before proceeding. Do not add `receive-message` to a queue health check.

## CloudWatch logs

Use a UTC interval and a narrow log group/filter. This example covers 2026-10-01 00:00 -> 01:00 UTC; native `--start-time` and `--end-time` take epoch milliseconds. Replace the dates, group and correlation ID with the confirmed scope:

```bash
aws logs filter-log-events \
  --profile research-dev --region us-west-2 \
  --log-group-name /synthetic/worker \
  --start-time 1790812800000 --end-time 1790816400000 \
  --filter-pattern '"synthetic-event-id"' \
  --limit 100 --no-paginate \
  --query '{events:events[].{eventId:eventId,timestamp:timestamp,logStreamName:logStreamName},nextToken:nextToken}' \
  --output json --no-cli-pager
```

`--no-paginate` returns one service page. `--query` omits message bodies from displayed output; the CLI still retrieves the matching events locally. A returned `nextToken` means incomplete coverage, even if the page is empty. For the next page, repeat the same scoped command with `--next-token '<returned-token>'`; stop when the question is answered or the token is absent. Record pages read and remaining coverage. Read failure and access denial remain separate from an empty result.

If message bodies are needed, inspect them in a local terminal/file and redact sensitive content locally before it enters a model prompt or shared file. Avoid broad raw-log exports. There is no custom wrapper or extra runtime dependency for these commands.

## Vantage

Discover available tools and inspect get-myself/access when present. Confirm an unnamed workspace if several exist. Resolve account names to account IDs and provider/service values from discovery results; do not invent VQL identifiers. Date range defaults to the relevant question, or a bounded recent window if no date was supplied. Queries should have provider, account/workspace and dates. For comparisons align periods and currency and distinguish actual, forecast, credits, amortization, allocation and billing lag.

Prefer existing reports or one query with relevant groupings over repeated overlapping exports. Treat cost recommendations as proposals: verify utilization/dependencies before claiming removable spend. Never create reports, update tags/budgets, buy commitments, or apply recommendations unless separately requested.

## Official references

- [SQS queue attributes](https://docs.aws.amazon.com/cli/latest/reference/sqs/get-queue-attributes.html)
- [SQS queue tags](https://docs.aws.amazon.com/cli/latest/reference/sqs/list-queue-tags.html)
- [SQS message receive effects](https://docs.aws.amazon.com/cli/latest/reference/sqs/receive-message.html)
- [CloudWatch log filtering and pagination](https://docs.aws.amazon.com/cli/latest/reference/logs/filter-log-events.html)
- [AWS identity](https://docs.aws.amazon.com/cli/latest/reference/sts/get-caller-identity.html)
- [Vantage MCP](https://docs.vantage.sh/mcp)

Checked 2026-10-06 for this skill's initial workflow. Refresh official docs and actual tool schemas before giving API-specific guidance; recorded documentation is not a permanent version guarantee.
