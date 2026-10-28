---
title: Errors
description: Every Rapid Parcels API reports errors as problem details.
---

## Problem details

Errors use [RFC 9457 problem details](https://www.rfc-editor.org/rfc/rfc9457) with the media type `application/problem+json`:

```json
{
  "type": "https://developers.rapidparcels.example/problems/forbidden",
  "title": "Missing permission",
  "status": 403,
  "detail": "This operation needs shipments:write."
}
```

### Fields

| Field | Use it for |
| :--- | :--- |
| `type` | Branching in code. It identifies the problem and never changes. |
| `title` | A short summary for logs. It may be reworded. |
| `status` | The HTTP status, repeated for convenience. |
| `detail` | What went wrong with this request, for people. Show it to your developers, not your customers. |
| `errors` | On `400`, one entry per invalid field, with its JSON pointer. |

### Validation errors

A `400` lists every invalid field at once, so you can fix them in one go:

```json
{
  "type": "https://developers.rapidparcels.example/problems/invalid-request",
  "title": "Invalid request",
  "status": 400,
  "errors": [
    { "pointer": "/to/country", "detail": "Must be a two-letter ISO code." },
    { "pointer": "/parcels/0/weight_kg", "detail": "Must be at most 70." }
  ]
}
```

## Status codes

| Status | Meaning | What to do |
| :--- | :--- | :--- |
| `400` | The request is invalid | Fix the field named in `detail` |
| `401` | No access token, or it is invalid or expired | Sign in again or refresh the token |
| `403` | The token lacks the operation's permission | Ask for the role that grants it (see [Authentication](/docs/authentication)) |
| `404` | Not found | Check the id |
| `409` | Conflicts with the current state, or an `Idempotency-Key` was reused | Fetch the resource and decide |
| `422` | Valid, but can't be done (expired quote, unserviceable route) | Read `detail` |
| `429` | Too many requests | Wait for `Retry-After` seconds |

## Retrying

### Which errors to retry

Retry `429`, `502`, `503` and `504`, and timeouts where you got no response at all. Don't retry other `4xx` responses: the same request will fail the same way.

### How long to wait

Wait the `Retry-After` seconds when the response has the header; otherwise back off exponentially from one second, with some random jitter. [Rate limits](/docs/concepts/rate-limits) has a ready-made function.

:::danger[Retrying can book twice]

Retry a `POST` only with the same `Idempotency-Key` as the first attempt. Without one, a retry after a timeout can create a second shipment, and a second invoice.

:::

:::warning{title="The Tracking API is different"}

The Tracking API is older and answers `{ "code": "...", "message": "..." }` instead of problem details.

:::

## Trying errors against the mock

:::rocket{title="Test your error handling first"}

The mock server can return any documented response. Send `Prefer: code=409` to get an operation's 409 example before the real API ever sends one.

:::
