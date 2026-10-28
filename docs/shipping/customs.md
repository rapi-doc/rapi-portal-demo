---
title: Customs
description: What to add when a parcel leaves the EU customs union.
sidebar:
  order: 4
---

Parcels between EU countries need no customs data. Parcels to or from anywhere else, including the United Kingdom, Switzerland and Norway, must say what is inside, what it is worth and where it was made.

## When customs data is required

| From → To | Customs data |
| :--- | :--- |
| EU → EU | Not needed |
| EU → GB, CH, NO and other non-EU countries | Required |
| Non-EU → EU | Required |
| Documents only, any route | Only a description: `"Documents"` |

:::info[Booking without it fails]

A non-EU shipment without customs data is refused with `422` and `detail: "customs is required for shipments to GB."`, before anything is charged.

:::

## Describing the contents

### Customs items

Add a `customs` object to the shipment, with one item per kind of goods:

```json
{
  "customs": {
    "reason": "sale",
    "items": [
      {
        "description": "Ceramic coffee mug",
        "quantity": 2,
        "value": 18.5,
        "currency": "EUR",
        "hs_code": "6912.00",
        "origin_country": "PT"
      }
    ]
  }
}
```

`reason` is one of `sale`, `gift`, `sample`, `return` or `documents`.

### HS codes

The Harmonized System code classifies the goods; customs uses it to set the duty. Six digits are enough for most countries. Look them up in the EU's [TARIC database](https://ec.europa.eu/taxation_customs/dds2/taric/), or ask your customs broker for the codes of your catalogue once.

:::tip[Store HS codes with your products]

Add the code to each product in your catalogue. Then every shipment can fill in customs items automatically, without someone looking codes up at the packing table.

:::

### Values and currency

`value` is the price of one item, in `currency`. Use the price the customer paid, not the cost price; for gifts and samples, use what the item would sell for.

:::warning[Undervalued parcels are held]

A value that is obviously too low is a common reason for a parcel to sit in customs for weeks, and it can lead to a fine. Declare the real value.

:::

## Documents

### CN22 and CN23

The customs form is printed with the label. Rapid Parcels picks the form from the total value: CN22 up to €300, CN23 above. You don't need to choose.

### Commercial invoice

Goods sold for more than €1,000 also need a commercial invoice. Upload your PDF with `POST /shipments/{shipmentId}/documents` before pickup, or let Rapid Parcels generate one from the customs items.

## Duties and taxes

Who pays import duty and VAT is set by `incoterm` on the shipment.

### DAP: the recipient pays

The default. The carrier collects duty and VAT from your customer before delivery, often with a handling fee. Simple for you, but customers may refuse the parcel.

### DDP: you pay

Rapid Parcels pays at the border and invoices you. Your customer pays nothing extra on delivery, which is what most online shoppers expect.

:::note

For parcels to the United Kingdom worth up to £135, VAT is charged at checkout instead of at the border, and DDP is the only option. Your shop must be registered for UK VAT.

:::
