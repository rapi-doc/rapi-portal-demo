---
title: Versioning
description: What can change without notice, and how breaking changes are announced.
sidebar:
  order: 4
---

Each API has its own version, shown at the top of its reference. Minor versions add things; a new major version is the only place where something you rely on can break.

## Current versions

| API | Version | Status |
| :--- | :--- | :--- |
| Rates | 1.4.0 | Stable |
| Shipments | 2.3.0 | Stable |
| Tracking | 1.9.2 | Stable |
| Carrier Partners | 0.9.0 | Beta: may change with notice in the changelog |
| Billing | 3.0.1 | Internal |

## Changes without notice

These changes ship in minor versions, so your client must accept them.

### New fields

Responses may gain fields. Ignore the ones you don't know instead of failing on them, and never compare whole response bodies in tests.

### New enum values

A field like `status` may gain values. Today a shipment can be `booked`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `returned` or `cancelled`; tomorrow there may be another.

:::caution[Have a default branch]

Code that switches on `status` needs a branch for values it doesn't know, for example by showing the raw value. Otherwise a new status breaks your order page the day it ships.

:::

### New endpoints and optional parameters

New operations and new optional query parameters can appear at any time. Required parameters are never added to an existing operation.

## Breaking changes

### What counts as breaking

Removing or renaming a field, an operation or an enum value; making an optional parameter required; changing a field's type or meaning. These only happen in a new major version, with a new base path such as `/v2`.

### How they are announced

An operation that will go away answers with two headers for at least six months beforehand:

```http
Deprecation: @1780272000
Sunset: Mon, 01 Jun 2027 00:00:00 GMT
Link: <https://developers.rapidparcels.example/docs/concepts/versioning>; rel="deprecation"
```

:::megaphone{title="Shipments v3 is planned for 2027"}

It replaces the `parcels[].weight_kg` number with a `weight` object that has a unit. Version 2 keeps working for twelve months after v3 is released.

:::

### Moving to a new major version

Both versions run side by side during the migration window. Move one operation at a time, and log the `Deprecation` header in your client so you notice operations you missed.
