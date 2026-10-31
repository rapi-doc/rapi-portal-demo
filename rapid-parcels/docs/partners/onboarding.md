---
title: Partner onboarding
description: What a carrier needs before delivering Rapid Parcels' last mile.
---

This section is for partner carriers (role **carrier-partner**).

## Before your first pickup

1. **Accounts.** The Partner Desk creates accounts for your engineers with the carrier-partner role.
2. **Services.** Tell us which services you run (ground, air, same-day); they appear in `GET /services` of the [Carrier Partners API](/apis/carriers).
3. **Hubs.** You collect at one or more hubs, e.g. `HUB-LIL` (Lille).

## A normal day

| Time | You | API |
| :--- | :--- | :--- |
| 05:00 | Read today's manifest for your hub | `GET /manifests?hub=HUB-LIL&date=…` |
| 06:30 | Arrive and load | `PUT /pickups/{pickupId}/status` (`arrived`, `loading`, `departed`) |
| During the day | Upload the labels you print | `POST /labels` ([label upload](/docs/partners/label-upload)) |
| For tomorrow | Book a slot, or an on-demand pickup | `POST /pickups` ([pickups](/docs/partners/pickups)) |
