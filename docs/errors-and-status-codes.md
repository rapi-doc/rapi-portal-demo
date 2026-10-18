# Error Handling & Problem Details

BrewCraft uses standard HTTP response codes and formats error responses according to the **RFC 7807 Problem Details for HTTP APIs** specification.

---

## Standard Error Structure

Every 4xx and 5xx response returns a JSON payload with the following fields:

```json
{
  "type": "https://brewcraft.io/errors/invalid-request",
  "title": "Invalid Order Payload",
  "status": 400,
  "detail": "Item quantity must be an integer of 1 or greater.",
  "instance": "/v1/orders/create",
  "invalidParams": [
    {
      "name": "items[0].quantity",
      "reason": "must be >= 1"
    }
  ]
}
```

---

## HTTP Status Codes Summary

| Code | Status | Meaning |
| :--- | :--- | :--- |
| **200** | OK | Request succeeded. |
| **201** | Created | Resource successfully created (e.g., new order or reservation). |
| **204** | No Content | Action completed with no response body (e.g., order cancelled). |
| **400** | Bad Request | Validation error or malformed JSON payload. |
| **401** | Unauthorized | Missing or expired token or API key. |
| **403** | Forbidden | Valid credentials, but insufficient permissions. |
| **404** | Not Found | Requested order, reservation, or item does not exist. |
| **409** | Conflict | Conflict state (e.g., table already booked at the requested time). |
| **429** | Too Many Requests | Rate limit exceeded. |
| **500** | Internal Server Error | Unexpected server error. |
