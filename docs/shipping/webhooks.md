---
title: Shipment webhooks
description: Get told when a shipment changes status or is delivered.
---

Instead of polling `GET /shipments/{shipmentId}`, register a webhook endpoint and Rapid Parcels POSTs events to it:

| Event | When |
| :--- | :--- |
| `shipment.status_changed` | The shipment moves to a new status (`picked_up`, `in_transit`, `out_for_delivery`, …) |
| `shipment.delivered` | The parcel was delivered |

Both are documented in the [Shipments API reference](/apis/shipments) under **Webhooks**, with their payloads.

## Answering

- Answer `2xx` within 10 seconds; do the work afterwards.
- Failed deliveries are retried with backoff for 24 hours.
- Events can arrive twice or out of order: use `id` to skip duplicates and `created_at` to order them.

## Endpoints

Webhook endpoints are managed by the platform team (Admin API, `webhook-endpoints`).
