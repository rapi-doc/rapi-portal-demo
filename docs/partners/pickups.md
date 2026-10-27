---
title: Pickups
description: Scheduled slots and on-demand pickups at Rapid Parcels hubs.
---

`POST /pickups` books either kind; the `type` field decides which other fields apply:

| `type` | Fields | Use it when |
| :--- | :--- | :--- |
| `scheduled` | `slot_start`, `vehicles` | You collect at a fixed time, usually every day |
| `on_demand` | `ready_by`, `parcels_estimate` | Extra volume, as soon as possible |

The [Carrier Partners API reference](/apis/carriers) shows both shapes (a `oneOf` with a discriminator) and an example of each.

A full slot answers `409`; pick another time.
