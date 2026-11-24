# Activity 7 - IT Support Desk Backend

A standalone REST API built with Node.js, Express and PostgreSQL.

## Record fields

- `id` - generated automatically by PostgreSQL
- `title`
- `category`
- `description`
- `status` - `Pending`, `In progress`, or `Completed`

The database table is created automatically when the server starts. `schema.sql` is also included as a reference.

## Requirements

- Node.js 18 or newer
- A PostgreSQL database (local or hosted)

## Run locally

1. Open this folder in VS Code.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`.
4. Put your PostgreSQL connection string in `DATABASE_URL`.
5. Start the API:

   ```bash
   npm start
   ```

The API runs at `http://localhost:3000` unless another `PORT` is supplied.

For automatic restart during development:

```bash
npm run dev
```

## API routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API information |
| GET | `/health` | API and database health |
| GET | `/api/records` | Get all records |
| GET | `/api/records/:id` | Get one record |
| POST | `/api/records` | Create a record |
| PUT | `/api/records/:id` | Update a record |
| DELETE | `/api/records/:id` | Delete a record |

## Example POST / PUT JSON body

```json
{
  "title": "Projector not working",
  "category": "Hardware",
  "description": "The lecture room projector does not turn on.",
  "status": "Pending"
}
```

`title`, `category`, and `description` are required. If `status` is omitted, it defaults to `Pending`. Only the three listed status values are accepted.

## Example responses

- Successful GET: `200 OK`
- Successful POST: `201 Created`
- Invalid input or ID: `400 Bad Request`
- Record not found: `404 Not Found`
- Database unavailable on health check: `503 Service Unavailable`

## Notes

- PostgreSQL generates each record ID.
- SQL queries use parameterized values (`$1`, `$2`, etc.) to help prevent SQL injection.
- Data is stored in PostgreSQL, not browser localStorage.
- This project is independent of Activity 6. Activity 8 will connect the frontend to this API.
- Do not commit your real `.env` file or publish your database password.
