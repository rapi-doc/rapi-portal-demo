---
title: Errors
description: Every Rapid Parcels API reports errors as problem details.
---

Errors use [RFC 9457 problem details](https://www.rfc-editor.org/rfc/rfc9457) with the media type `application/problem+json`:

```json
{
  "type": "https://developers.rapidparcels.example/problems/forbidden",
  "title": "Missing permission",
  "status": 403,
  "detail": "This operation needs shipments:write."
}
```

`type` identifies the problem and stays stable; `title` and `detail` are for people.

| Status | Meaning | What to do |
| :--- | :--- | :--- |
| `400` | The request is invalid | Fix the field named in `detail` |
| `401` | No access token, or it is invalid or expired | Sign in again or refresh the token |
| `403` | The token lacks the operation's permission | Ask for the role that grants it (see [Authentication](/docs/authentication)) |
| `404` | Not found | Check the id |
| `409` | Conflicts with the current state, or an `Idempotency-Key` was reused | Fetch the resource and decide |
| `422` | Valid, but can't be done (expired quote, unserviceable route) | Read `detail` |
| `429` | Too many requests | Wait for `Retry-After` seconds |

The Tracking API, which is older, answers `{ "code": "...", "message": "..." }` instead.

## Trying errors against the mock

The mock server can return any documented response. Send `Prefer: code=409` to get the 409 example of an operation, for example to test your error handling.
