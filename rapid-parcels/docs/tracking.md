---
title: Tracking parcels
description: Follow a parcel by tracking number, or get its events pushed to you.
---

Every shipment gets a tracking number like `RP123456789FR`. The [Tracking API](/apis/tracking) answers two questions:

- **Where is it now?** `GET /tracking/{trackingNumber}` returns the status, the last event and the estimated delivery date.
- **What happened so far?** `GET /tracking/{trackingNumber}/events` lists every scan, oldest first.

## Push instead of polling

`POST /subscriptions` registers a `callback_url`. Rapid Parcels then POSTs each new event there until the parcel is delivered. The callback is documented in the API reference under the operation's **Callbacks**.

### Creating a subscription

```sh
curl -X POST http://localhost:4010/tracking/subscriptions \
  -H "Authorization: Bearer $RP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tracking_number": "RP123456789FR", "callback_url": "https://shop.example/hooks/tracking"}'
```

### What you receive

One POST per event, with the same fields as an entry of `GET /tracking/{trackingNumber}/events`:

```json
{
  "tracking_number": "RP123456789FR",
  "code": "OFD",
  "description": "Out for delivery",
  "location": "Paris 1er, FR",
  "occurred_at": "2026-10-28T07:42:00Z"
}
```

### Stopping

A subscription ends by itself after `DLV` or `RTS`. To stop earlier, `DELETE /subscriptions/{subscriptionId}`.

:::zap{title="Push beats polling"}

A subscription sends each event once, seconds after the scan. Polling every parcel every few minutes costs thousands of requests a day and still arrives later.

:::

## Event codes

:::sparkles[New: delivery estimates update after every scan]

`estimated_delivery` is now recalculated at each `HUB` and `CUS` event, not only at booking.

:::

| Code | Meaning |
| :--- | :--- |
| `BKD` | Shipment booked |
| `PCK` | Picked up |
| `HUB` | Arrived at a hub |
| `CUS` | In customs |
| `OFD` | Out for delivery |
| `DLV` | Delivered |
| `EXC` | Exception (address problem, damage) |
| `RTS` | Returning to sender |

## Polling, if you must

Without a subscription, poll `GET /tracking/{trackingNumber}` no more than once every 15 minutes per parcel. Each response says when to ask again:

```http
HTTP/1.1 200 OK
Cache-Control: max-age=900
ETag: "evt_01J4K9"
```

:::note[Send the ETag back]

With `If-None-Match: "evt_01J4K9"` the API answers `304 Not Modified` when nothing changed, and that request does not count against your rate limit.

:::

## Access

The Tracking API reference is for the **tracker** role. Calls need the `tracking:read` permission, or an `X-Api-Key` for server-to-server integrations. See [Authentication](/docs/authentication).
