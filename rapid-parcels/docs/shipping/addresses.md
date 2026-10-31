---
title: Addresses
description: The address fields, country rules, and how to catch bad addresses before you book.
sidebar:
  order: 2
---

Most failed deliveries start with an address. The Shipments API checks every address when you book, and refuses one it can't deliver to, so the earlier you catch problems, the fewer parcels come back.

## Address fields

```json
{
  "name": "Jane Doe",
  "company": "Doe Ceramics",
  "line1": "12 Rue de Rivoli",
  "line2": "Bâtiment B, 3e étage",
  "postal_code": "75001",
  "city": "Paris",
  "country": "FR",
  "email": "jane@example.com",
  "phone": "+33 6 12 34 56 78"
}
```

### Required fields

| Field | Rule |
| :--- | :--- |
| `name` | The person who receives the parcel |
| `line1` | Street and number |
| `postal_code` | In the country's own format (below) |
| `city` | The city or town |
| `country` | Two-letter ISO 3166 code, upper case: `FR`, not `fr` or `France` |

### Contact details

`email` and `phone` are optional but strongly recommended. The carrier uses them to announce the delivery and to arrange a new one when nobody is home.

:::tip[Phone numbers in international format]

Send numbers with the country code, such as `+33 6 12 34 56 78`. A local number like `06 12 34 56 78` can't be used by a carrier in another country.

:::

## Country rules

### Postal codes

| Country | Format | Example |
| :--- | :--- | :--- |
| Germany (`DE`) | 5 digits | `10115` |
| France (`FR`) | 5 digits | `75001` |
| Netherlands (`NL`) | 4 digits, space, 2 letters | `1012 AB` |
| United Kingdom (`GB`) | 5 to 7 characters, with a space | `SW1A 1AA` |
| Ireland (`IE`) | Eircode, 7 characters | `D02 X285` |

### Line length

Each line holds at most 35 characters, the limit printed on labels. Put the building, floor or door code in `line2` rather than making `line1` longer.

:::caution[Don't send the country name in line2]

The label already prints the country from `country`. A country name in `line2` ends up on the label twice and can confuse sorting machines.

:::

## Validating before you book

### Coverage

`GET /coverage/{country}` in the [Rates API](/apis/rates) says whether Rapid Parcels delivers to a country and which postal codes are excluded, such as some islands. Check it in your checkout, before the customer pays.

### Common rejections

A rejected address comes back as a `400` with the field and the reason:

```json
{
  "type": "https://developers.rapidparcels.example/problems/invalid-request",
  "title": "Invalid request",
  "status": 400,
  "detail": "to.country must be a two-letter ISO code."
}
```

| `detail` | Fix |
| :--- | :--- |
| `to.country must be a two-letter ISO code.` | Send `FR`, not `France` |
| `to.postal_code does not match the format for NL.` | Use `1012 AB`, with the space |
| `to.line1 is longer than 35 characters.` | Move the rest to `line2` |

:::info

Addresses are checked for format, not for existence: `1 Fake Street` passes if it is well formed. Use an address autocomplete in your checkout to catch typos in real street names.

:::
