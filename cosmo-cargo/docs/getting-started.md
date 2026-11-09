# Welcome to the Cosmo Cargo Developer Platform

Cosmo Cargo's APIs let shippers, freight forwarders and spaceport operators book, label and track cargo across the galaxy: from a parcel to low orbit to a hazmat container bound for the outer colonies.

---

## Architecture & Base URLs

The Shipment API runs in three environments:

| Environment | Base URL | Usage |
| :--- | :--- | :--- |
| **Development** | `https://api.dev.sh.example.com/v1` | Building and debugging your integration |
| **Staging** | `https://api.staging.sh.example.com/v1` | Integration tests and mock launches |
| **Production** | `https://api.sh.example.com/v1` | Live shipments, customs filings and billing |

---

## The Cosmo Cargo API Suite

The APIs are organized by what you ship and who runs it:

1. **Shipment API**: Create shipments, calculate rates, file customs and track every leg.
2. **Labels & Stamps API**: Print shipping labels and postage, in three API versions.
3. **Cargo Container Specifications API**: Quote and book standard, refrigerated, pressurized and hazmat containers.
4. **Fleet Operations API**: Vessels, warp routes and cargo bays.
5. **Webhook API**: Get notified when shipments are created, delayed or delivered.

The [API Catalog](/catalog) lists all of them.

---

## Rate Limiting

To keep the launch queue moving:
- **Development and staging**: 100 requests per minute per IP.
- **Production**: 1,000 requests per minute per API key.

When you exceed these limits, requests return an HTTP `429 Too Many Requests` response with a `Retry-After` header giving the wait in seconds.
