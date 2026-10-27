---
title: Tracking parcels
description: Follow a parcel by tracking number, or get its events pushed to you.
---

Every shipment gets a tracking number like `RP123456789FR`. The [Tracking API](/apis/tracking) answers two questions:

- **Where is it now?** `GET /tracking/{trackingNumber}` returns the status, the last event and the estimated delivery date.
- **What happened so far?** `GET /tracking/{trackingNumber}/events` lists every scan, oldest first.

## Push instead of polling

`POST /subscriptions` registers a `callback_url`. Rapid Parcels then POSTs each new event there until the parcel is delivered. The callback is documented in the API reference under the operation's **Callbacks**.

## Event codes

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

## Access

The Tracking API reference is for the **tracker** role. Calls need the `tracking:read` permission, or an `X-Api-Key` for server-to-server integrations. See [Authentication](/docs/authentication).
