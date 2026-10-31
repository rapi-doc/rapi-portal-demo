---
title: Admin procedures
description: Routine work for platform admins.
---

Internal: for the **platform-admin** role. Everything here uses the [Admin API](/apis/admin).

## Rotate a leaked API key

1. Find it: `GET /api-keys?q=<prefix>`.
2. Rotate it: `POST /api-keys/{apiKeyId}/rotate`. The old key stops working within a minute.
3. Check the audit log: `GET /audit-logs?q=api_key.rotated`.

## Offboard someone

1. `POST /users/{userId}/suspend`
2. Revoke their sessions: `GET /sessions?q=<user id>`, then `POST /sessions/{sessionId}/revoke` for each.
3. Rotate any secrets they had access to: `POST /secrets/{secretId}/rotate`.

## Deprecated calls

`PUT` on users, roles, organizations, API keys, webhook endpoints, feature flags and rate limits is deprecated; use `PATCH`, which only changes the fields you send.
