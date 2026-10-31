---
title: Idempotency
description: Retry a POST safely by sending the same Idempotency-Key.
sidebar:
  order: 2
---

Networks fail at the worst moment: after the server has booked your shipment, but before you receive the answer. An `Idempotency-Key` makes the retry safe. The server remembers the key and the result, and a retry with the same key gets the first result back instead of a second shipment.

## Why retries are dangerous

Without a key, a client that times out cannot know whether the request arrived:

| What happened | What a blind retry does |
| :--- | :--- |
| The request never arrived | Books the shipment. Fine. |
| The shipment was booked, the response was lost | Books a **second** shipment, with a second label and a second invoice. |

:::danger[A timeout is not a failure]

When a `POST /shipments` times out, assume the shipment may exist. Retry with the same key, or look it up, before you book again.

:::

## Sending a key

`POST /shipments` requires the header. Generate a new key for each shipment you mean to create, and reuse it only for retries of that same request:

```sh
curl -X POST http://localhost:4010/shipments/shipments \
  -H "Authorization: Bearer $RP_TOKEN" \
  -H "Idempotency-Key: 6f0f1e3a-63b1-4d1b-9a43-2bde6c1a3f10" \
  -H "Content-Type: application/json" \
  -d @shipment.json
```

### Choosing a key

A UUID is the simplest choice. A key derived from your own data, such as `order-10432-shipment-1`, also works and has one advantage: a retry after your process restarts still finds the same key. Keys can be up to 64 characters.

### What counts as the same request

The server compares the method, the path and the body. A retry must send exactly the same body; only headers such as `Authorization` may differ.

## Responses

### A replayed response

A retry within the key's lifetime gets the first response again, with the same status code and body, even if that response was an error. Nothing is booked twice.

### Key reused for a different request

Send a key you already used with a different body, and the API refuses:

```json
{
  "type": "https://developers.rapidparcels.example/problems/idempotency-key-reused",
  "title": "Idempotency key reused",
  "status": 409,
  "detail": "This Idempotency-Key was used for a different request."
}
```

:::tip[Store the key with the order]

Save the key next to the order before you call the API. After a crash, the retry then uses the same key, and you get the existing shipment back.

:::

## How long keys last

Keys are kept for 24 hours. After that, the same key books a new shipment, so don't retry a day-old request: look up the shipment with `GET /shipments` instead.

:::info

Only `POST` requests need a key. `GET`, `PUT` and `DELETE` are idempotent by definition: repeating them has the same effect as sending them once.

:::
