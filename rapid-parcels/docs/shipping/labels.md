---
title: Printing labels
description: Download a shipment's label as PDF, PNG or ZPL.
sidebar:
  order: 5
---

Every booked shipment has one label per parcel. Download it from `GET /shipments/{shipmentId}/label` and tell the API which format you want with the `Accept` header:

| Format | `Accept` | Best for |
| :--- | :--- | :--- |
| PDF | `application/pdf` | Office printers; A6 page, or two labels per A4 with `?layout=a4` |
| PNG | `image/png` | Showing the label on screen; 300 dpi |
| ZPL | `application/zpl` | Thermal label printers (Zebra and compatible) |

```sh
curl http://localhost:4010/shipments/shipments/shp_01HZX5/label \
  -H "Authorization: Bearer $RP_TOKEN" \
  -H "Accept: application/zpl" \
  -o label.zpl
```

:::tip[ZPL goes straight to the printer]

Send the ZPL bytes to the printer's port 9100 as they are. The label is sized for 100 × 150 mm stock at 203 dpi; add `?dpi=300` for 300 dpi printers.

:::

:::note

Labels are generated when the shipment is booked, so the first download is as fast as any other. There is no need to call the endpoint right after booking "to warm it up".

:::

:::warning{title="Labels expire with the shipment"}

A label is valid until the shipment's `pickup_by` time, usually the end of the next business day. After that the barcode is rejected at pickup; cancel the shipment and book a new one.

:::

## Return labels

Add `"return_label": true` when booking and the response includes a second label, addressed back to you. Return labels are charged only when they are scanned.

:::info[Pre-paid or on scan]

Return labels cost nothing to print. You pay the return rate when the carrier scans the label, so you can put one in every parcel.

:::
