# @hackuta/db

Prisma + SQLite database package for the monorepo.

## Schema
Defined in `prisma/schema.prisma` with models `User` and `Post`.

## Getting Started

1. Add an env var for the SQLite file (root or package). Example: create `packages/db/.env`:
```
DATABASE_URL="file:./dev.db"
```
Prisma also loads from root `.env` if present.

2. Install dependencies (at repo root):
```
pnpm install
```

3. Generate the Prisma client & run initial migration:
```
pnpm --filter @hackuta/db prisma:generate
pnpm --filter @hackuta/db prisma:migrate
```

4. Use the helpers in code:
```ts
import { createUser, listUsers } from '@hackuta/db';

async function demo() {
  const user = await createUser('alice@example.com', 'Alice');
  console.log(user);
  console.log(await listUsers());
}
```

## CRUD Helpers
See `src/user.ts` and `src/post.ts` for simple wrappers.

## Development Notes
- Hot-reload safe singleton Prisma client in `src/client.ts`.
- For ad-hoc exploration: `pnpm --filter @hackuta/db prisma:studio`.
- Migrations are stored in `prisma/migrations` (created after first migrate).

## TODO / Next Steps
- Add tests
- Add seeding script
- Add more models
