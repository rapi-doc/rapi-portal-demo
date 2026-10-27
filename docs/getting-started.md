---
title: Getting started
description: From a price quote to a booked shipment in three calls.
---

Rapid Parcels moves parcels from your warehouse to your customers. These docs cover six APIs; you need two of them to ship your first parcel.

## 1. Quote a price (public)

The [Rates API](/apis/rates) needs no account. Ask what a 2.5 kg parcel from Berlin to Paris costs:

```sh
curl "http://localhost:4010/rates/rates?from=10115,DE&to=75001,FR&weight_kg=2.5"
```

Locally, requests go to the mock server (`rapidoc mock`); in production they would go to `https://api.rapidparcels.example/v1`, which is fictional.

For a binding price, create a quote with `POST /rates/quote`; it stays valid for 30 minutes.

## 2. Get access to the Shipments API

Shipping needs an account with the **shipper** role. [Authentication](/docs/authentication) explains how signing in to this portal and calling the APIs work, and why they are two different things.

## 3. Book the shipment

With an access token that has the `shipments:write` permission:

```sh
curl -X POST http://localhost:4010/shipments/shipments \
  -H "Authorization: Bearer $RP_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"service": "express", "quote_id": "quo_01HZX4M8Q2", "from": {...}, "to": {...}, "parcels": [{"weight_kg": 2.5}]}'
```

The [shipping guides](/docs/shipping/create-shipment) walk through it with the live console, once you're signed in as a shipper.

## Where to go next

- [Tracking](/docs/tracking): follow a parcel, or have every event pushed to your server.
- [Errors](/docs/errors): every API answers errors the same way.
