---
title: Shipment statuses
description: The states a shipment goes through, and what you can still change in each.
sidebar:
  order: 3
---

Every shipment has a `status`. It changes as the parcel moves, and each change is sent to your [webhook](/docs/shipping/webhooks) as `shipment.status_changed`.

## Statuses

| Status | Meaning | You can still |
| :--- | :--- | :--- |
| `booked` | Booked and labelled, waiting for pickup | Cancel, reprint the label |
| `picked_up` | The carrier has it | Follow it |
| `in_transit` | Between hubs | Follow it |
| `out_for_delivery` | On the van today | Follow it |
| `delivered` | Delivered | Read the proof of delivery |
| `returned` | Sent back to you | Book it again |
| `cancelled` | Cancelled before pickup | Nothing; book a new one |

## From booking to delivery

### Booked

`POST /shipments` creates the shipment as `booked` and returns its tracking number and label. Print the label and hand the parcel over by the shipment's `pickup_by` time.

### On the way

The first scan moves it to `picked_up`, and each hub scan keeps it `in_transit`. The individual scans are in the [Tracking API](/docs/tracking), which has more detail than the shipment status.

### Delivered

`delivered` is final. The shipment then has a `delivered_at` time and, for signed deliveries, the name of the person who signed.

:::success[Delivered is the moment to close the order]

Use `shipment.delivered`, not the carrier's estimate, to mark an order as complete or to start a return window.

:::

## Cancelling

### When you can cancel

Only a `booked` shipment can be cancelled, with `POST /shipments/{shipmentId}/cancel`. Once the carrier has scanned it, the parcel is on its way and the request returns `409`.

:::danger[Cancelling can't be undone]

A cancelled shipment's label stops working at once. If the parcel still goes out, it is returned to you. Book a new shipment instead of reusing the old label.

:::

### Refunds

A cancelled shipment is not charged. If it was already invoiced, the refund appears as a credit on the next invoice.

## Returns

A parcel that can't be delivered, for example after three failed attempts, is sent back and ends as `returned`. You pay the return rate; book a new shipment to try again, with a corrected address.

:::note

Tracking events give the reason for a return: look for the last `EXC` event before `RTS` in `GET /tracking/{trackingNumber}/events`.

:::
