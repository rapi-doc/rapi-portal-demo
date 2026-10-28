---
title: Shipment webhooks
description: Get told when a shipment changes status or is delivered.
sidebar:
  order: 6
---

Instead of polling `GET /shipments/{shipmentId}`, register a webhook endpoint and Rapid Parcels POSTs events to it:

| Event | When |
| :--- | :--- |
| `shipment.status_changed` | The shipment moves to a new status (`picked_up`, `in_transit`, `out_for_delivery`, …) |
| `shipment.delivered` | The parcel was delivered |

Both are documented in the [Shipments API reference](/apis/shipments) under **Webhooks**, with their payloads.

:::megaphone{title="Coming in March: tracking links"}

Webhook payloads will include `tracking_url`, a page your customers can open to follow their parcel.

:::

## Answering

- Answer `2xx` within 10 seconds; do the work afterwards.
- Failed deliveries are retried with backoff for 24 hours.
- Events can arrive twice or out of order: use `id` to skip duplicates and `created_at` to order them.

## Verifying a delivery

Every delivery is signed. The `Rapid-Signature` header holds a timestamp and an HMAC-SHA256 of `timestamp.body` with your endpoint's secret:

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

export function verify(body, header, secret) {
  const { t, v1 } = Object.fromEntries(header.split(',').map((part) => part.split('=')));
  const expected = createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
  return timingSafeEqual(Buffer.from(v1), Buffer.from(expected)) && Date.now() / 1000 - t < 300;
}
```

:::danger[Verify before you trust]

Anyone who finds your endpoint URL can POST to it. Reject deliveries whose signature does not match, or whose timestamp is older than five minutes, before you touch your database.

:::

:::tip[Use the raw body]

Compute the HMAC over the bytes you received, not over a re-serialized JSON object: a reordered key or a trailing newline changes the signature.

:::

## Endpoints

:::settings{title="Managed by the platform team"}

Webhook endpoints are registered with the Admin API (`webhook-endpoints`). Send the platform team your HTTPS URL and the events you want.

:::
