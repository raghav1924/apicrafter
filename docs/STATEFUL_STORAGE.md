# Stateful In-Memory Entity Engine

Unlike static JSON mocks, ApiCrafter maintains state across calls:
- `POST /api/items`: Inserts record with auto-increment or UUID.
- `GET /api/items/:id`: Fetches modified state.
- `PUT /api/items/:id`: Mutates entity in memory.
- `DELETE /api/items/:id`: Removes record.
