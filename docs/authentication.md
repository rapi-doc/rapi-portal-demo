---
title: Authentication
description: Signing in to the portal and calling the APIs are two different things.
---

Rapid Parcels uses one account for both, but they answer different questions:

| | Signing in to this portal | Calling an API |
| :--- | :--- | :--- |
| Question | Which docs and API references may you **read**? | Which operations may you **execute**? |
| Decided by | Your **role** | The **permissions** in your access token |
| Checked by | The portal (`rapidoc serve`) | The API itself (here: the mock server) |
| What you see | Locked pages show a lock; opening one asks you to sign in or says you don't have access | `401` without a token, `403` without the permission |

So a reviewer can read the Shipments reference but every call returns `403`: reading is allowed, executing is not.

## Roles

| Role | Can read | Can call |
| :--- | :--- | :--- |
| *(not signed in)* | Public docs, Rates API | Rates API |
| shipper | + Shipments API, shipping guides | Shipments |
| tracker | + Tracking API | Tracking |
| reviewer | + Shipments, Tracking, Carrier Partners | nothing |
| carrier-partner | + Carrier Partners API, partner guides | Carrier Partners |
| finance | + Billing API, internal runbooks | Billing |
| platform-admin | everything | everything |

## Getting a token for the APIs

Access tokens are issued by the Rapid Parcels sign-in service (Auth0) for the API `https://api.rapidocui.com`. Each operation lists the permission it needs, such as `shipments:write`.

- In an API reference, open **Authentication** and either sign in through **OAuth** or paste a token into **bearerAuth**.
- From your code, use the OAuth authorization code flow with PKCE against `https://rapidocui.us.auth0.com/`.

## API keys (Tracking only)

Server-to-server tracking integrations can send an `X-Api-Key` header instead of a token. Keys are issued by the platform team.
