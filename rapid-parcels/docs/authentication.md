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

:::info{title="Reading is not calling"}

A reviewer can read the Shipments reference, but every call returns `403`: reading is allowed, executing is not.

:::

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

### In an API reference

Open **Authentication** at the top of the reference and either sign in through **OAuth**, which uses the account you signed in to this portal with, or paste a token into **bearerAuth**. Every **Try** on the page then sends it.

### From your code

Use the OAuth authorization code flow with PKCE against `https://rapidocui.us.auth0.com/`. After the user signs in, exchange the code for a token:

```sh
curl -X POST https://rapidocui.us.auth0.com/oauth/token \
  -d grant_type=authorization_code \
  -d client_id=$RP_CLIENT_ID \
  -d code_verifier=$VERIFIER \
  -d code=$CODE \
  -d redirect_uri=https://shop.example/callback
```

:::success{title="Tokens last an hour"}

The response's `access_token` is valid for 60 minutes. Cache it and request a new one when a call returns `401`; don't request one per call.

:::

### Permissions in the token

The token's `permissions` claim lists what it may do. Decode it (it is a JWT) to check before you call:

```json
{
  "aud": "https://api.rapidocui.com",
  "permissions": ["shipments:read", "shipments:write"],
  "exp": 1793180400
}
```

| Permission | Lets you |
| :--- | :--- |
| `rates:quote` | Create binding quotes |
| `shipments:read` | List and fetch shipments, download labels |
| `shipments:write` | Book and cancel shipments |
| `tracking:read` | Fetch tracking events and manage subscriptions |
| `carriers:write` | Upload manifests and labels as a carrier partner |

## API keys (Tracking only)

Server-to-server tracking integrations can send an `X-Api-Key` header instead of a token. Keys are issued by the platform team.

### Sending a key

```sh
curl http://localhost:4010/tracking/tracking/RP123456789FR \
  -H "X-Api-Key: $RP_TRACKING_KEY"
```

### Rotating a key

Each integration may have two active keys. Ask for a second key, deploy it, then ask the platform team to revoke the first: there is no moment without a working key.

:::lock{title="Keep keys on your server"}

An API key works for anyone who has it. Never put it in a browser, a mobile app or a Git repository; load it from an environment variable on the server.

:::
