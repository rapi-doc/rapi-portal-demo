# Error Handling & Problem Details

Cosmo Cargo uses standard HTTP response codes and formats error responses according to the **RFC 7807 Problem Details for HTTP APIs** specification.

---

## Standard Error Structure

Every 4xx and 5xx response returns a JSON payload with the following fields:

```json
{
  "type": "https://cosmocargo.space/errors/invalid-request",
  "title": "Invalid Shipment Payload",
  "status": 400,
  "detail": "Package weight must be greater than 0.",
  "instance": "/v1/shipments",
  "invalidParams": [
    {
      "name": "packages[0].weight",
      "reason": "must be > 0"
    }
  ]
}
```

---

## HTTP Status Codes Summary

| Code | Status | Meaning |
| :--- | :--- | :--- |
| **200** | OK | Request succeeded. |
| **201** | Created | Resource successfully created (e.g., a new shipment or container booking). |
| **204** | No Content | Action completed with no response body (e.g., shipment cancelled). |
| **400** | Bad Request | Validation error or malformed JSON payload. |
| **401** | Unauthorized | Missing or expired token or API key. |
| **403** | Forbidden | Valid credentials, but insufficient permissions. |
| **404** | Not Found | Requested shipment, booking, or container does not exist. |
| **409** | Conflict | Conflict state (e.g., cargo bay already booked for the requested launch window). |
| **429** | Too Many Requests | Rate limit exceeded. |
| **500** | Internal Server Error | Unexpected server error. |
