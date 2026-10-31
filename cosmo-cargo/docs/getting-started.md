# Welcome to the BrewCraft Developer Platform

BrewCraft provides a modern, RESTful API platform enabling restaurants, coffee shops, and third-party delivery services to integrate seamlessly with our ordering, catalog, reservations, and loyalty ecosystems.

---

## Architecture & Base URLs

BrewCraft exposes two distinct environments:

| Environment | Base URL | Usage |
| :--- | :--- | :--- |
| **Sandbox** | `https://sandbox.brewcraft.io/v1` | Automated testing, integration tests, mock transactions |
| **Production** | `https://api.brewcraft.io/v1` | Live orders, payment processing, customer data |

---

## The BrewCraft API Suite

Our API surface is organized into five modular services:

1. **Orders API**: Place and track coffee, drink, and food orders with real-time status transitions.
2. **Catalog API**: Access categorized coffee blends, origin details, pastry inventories, and dietary tags.
3. **Reservations API**: Check table availability across patios, indoor tables, and bar seating.
4. **Loyalty & Rewards API**: Accrue BeanPoints, query customer tiers, and redeem gift coupons.
5. **Payments API**: Process credit cards, Apple Pay, Google Pay, and manage refunds.

---

## Rate Limiting

To maintain high availability:
- **Sandbox**: 100 requests per minute per IP.
- **Production**: 1,000 requests per minute per authenticated API key.

When you exceed these limits, requests return an HTTP `429 Too Many Requests` response with a `Retry-After` header indicating the wait time in seconds.
