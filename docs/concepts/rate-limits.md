---
title: Rate limits
description: How many requests you may send, how to see how many are left, and how to back off.
sidebar:
  order: 3
---

Rate limits keep the APIs fast for everyone. Each API counts requests per minute, per access token or API key; public Rates calls without a token are counted per IP address.

## Limits per API

| API | Limit | Counted per |
| :--- | :--- | :--- |
| Rates, signed out | 60 requests a minute | IP address |
| Rates, with a token | 600 requests a minute | Token |
| Shipments | 300 requests a minute | Token |
| Tracking | 1,200 requests a minute | Token or API key |
| Carrier Partners | 120 requests a minute | Token |

:::zap{title="Tracking has the highest limit for a reason"}

Customers refresh their tracking page often. If you still run into the limit, cache responses for the `max-age` the API sends, or [subscribe to events](/docs/tracking) instead of polling.

:::

## Reading the headers

### Before you hit the limit

Every response says where you stand:

```http
RateLimit-Limit: 300
RateLimit-Remaining: 287
RateLimit-Reset: 41
```

`RateLimit-Reset` is the number of seconds until the window starts again.

### When you hit the limit

The API answers `429 Too Many Requests` and says how long to wait:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 12
Content-Type: application/problem+json
```

:::warning[Retrying straight away makes it worse]

Requests sent during the wait are refused and still count. Wait the full `Retry-After`.

:::

## Backing off

### Exponential backoff with jitter

Without a `Retry-After`, for example after a `503`, wait longer after each failure and add some randomness, so that many clients don't retry at the same moment:

```js
export async function withRetry(send, attempts = 5) {
  for (let attempt = 0; ; attempt++) {
    const res = await send();
    if (res.status !== 429 && res.status < 500) return res;
    if (attempt === attempts - 1) return res;
    const retryAfter = Number(res.headers.get('Retry-After'));
    const backoff = 2 ** attempt * 1000 * (0.5 + Math.random());
    await new Promise((resolve) => setTimeout(resolve, retryAfter ? retryAfter * 1000 : backoff));
  }
}
```

### Spreading batch jobs

A nightly job that books 2,000 shipments at once will spend most of its time waiting. Send them at a steady pace instead, about four a second for the Shipments limit, and watch `RateLimit-Remaining` to slow down before you reach zero.

:::note

Limits can be raised for high-volume shippers. Ask your account manager, with your expected peak requests per minute.

:::
