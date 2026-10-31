---
title: Pagination
description: List endpoints return one page at a time; follow next_cursor until it is null.
sidebar:
  order: 1
---

Every list endpoint, such as `GET /shipments`, returns one page of results, newest first, and a cursor for the next page. Cursors are opaque: pass them back as they are, and never build or change one yourself.

## How a page looks

```json
{
  "data": [
    { "id": "shp_7Q2M9K", "status": "in_transit", "created_at": "2026-10-28T08:15:00Z" },
    { "id": "shp_7Q2M9J", "status": "delivered", "created_at": "2026-10-27T16:02:00Z" }
  ],
  "next_cursor": "eyJpZCI6InNocF83UTJNOUsifQ"
}
```

### Page size

`limit` sets how many items a page holds: at least 1, at most 100, and 20 when you leave it out. A page can hold fewer items than `limit` even when more follow, so don't use a short page to decide that you're done.

### The next page

Send `next_cursor` back as `cursor` to get the next page. When `next_cursor` is `null`, there are no more pages.

The same link is also in the `Link` response header, ready to follow:

```http
Link: </shipments?cursor=eyJpZCI6InNocF83UTJNOUsifQ&limit=20>; rel="next"
```

:::tip[Follow the Link header]

The header keeps your `limit` and any filters, so a client that follows `rel="next"` never has to rebuild the query.

:::

## Walking every page

### With curl

```sh
curl "http://localhost:4010/shipments/shipments?limit=100" \
  -H "Authorization: Bearer $RP_TOKEN"
# then, with the next_cursor from the response:
curl "http://localhost:4010/shipments/shipments?limit=100&cursor=eyJpZCI6InNocF83UTJNOUsifQ" \
  -H "Authorization: Bearer $RP_TOKEN"
```

### With JavaScript

An async generator hides the paging from the rest of your code:

```js
export async function* allShipments(token) {
  let cursor = null;
  do {
    const url = new URL('https://api.rapidparcels.example/v1/shipments');
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const page = await res.json();
    yield* page.data;
    cursor = page.next_cursor;
  } while (cursor);
}

for await (const shipment of allShipments(token)) console.log(shipment.id);
```

:::caution[Cursors expire after 24 hours]

A cursor older than a day returns `400`. A job that pauses overnight should start again from the first page instead of resuming.

:::

## Ordering and consistency

### New items while you page

Pages are anchored to the last item you saw, not to a page number. Shipments booked while you page appear at the start of the list, which you have already passed, so nothing is skipped or repeated.

### Filtering

Filters such as `status=in_transit` apply before paging. Change a filter and you must start again without a cursor: a cursor only works with the query it came from.

:::note

To sync a large history once, page with `limit=100` and the filters you need. To stay in sync afterwards, use [webhooks](/docs/shipping/webhooks) instead of paging again.

:::
