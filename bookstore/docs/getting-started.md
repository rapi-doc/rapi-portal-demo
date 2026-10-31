---
title: Getting Started
description: Quickstart guide to integrating with the Core Developer Platform.
---

# Getting Started

Welcome to the Developer Portal. This guide walks you through authenticating with our services and making your very first API request.

## Prerequisites

Before making requests, ensure you have:
1. Created an account on the Developer Dashboard.
2. Generated a secure API token with read/write access.

## Base URLs

| Environment | Base URL |
| :--- | :--- |
| **Production** | `https://api.example.com/v1` |
| **Sandbox** | `https://sandbox.example.com/v1` |

## First Request

Send an authenticated `GET` request to the health check endpoint:

```bash
curl -X GET "https://sandbox.example.com/v1/health" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

You will receive a `200 OK` response:

```json
{
  "status": "healthy",
  "timestamp": "2026-10-18T12:00:00Z"
}
```

## Next Steps

Explore the interactive API console or review our [Architecture Overview](/docs/guides/overview).
