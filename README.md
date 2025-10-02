<div align="center">

# HackUTA Full Stack Template

Monorepo template featuring a Next.js frontend, Express API, shared UI library, and a Prisma + SQLite database package, all orchestrated with Turborepo & pnpm.

</div>

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (`apps/web`) |
| API | Express (`apps/api`) |
| Database | Prisma ORM + SQLite (`packages/db`) |
| Shared UI | React component lib (`packages/ui`) |
| Tooling | Turborepo, pnpm, TypeScript, ESLint, Prettier |

## Prerequisites

- Node.js >= 18
- pnpm 9 (`corepack enable` or install manually)

Verify:
```cmd
node -v
pnpm -v
```

## Quick Start (All-in)

```cmd
pnpm install
pnpm run setup
pnpm dev
```

Then visit:
* Web: http://localhost:3000
* API: http://localhost:3001

## Root Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Run all dev tasks (Next.js + API) concurrently via Turborepo |
| `pnpm build` | Build all apps/packages |
| `pnpm lint` | Lint all workspaces |
| `pnpm check-types` | Type-check across the repo |
| `pnpm format` | Prettier format |
| `pnpm setup` | Generate Prisma client + run dev migration (idempotent) |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:migrate` | Run `prisma migrate dev` interactively |
| `pnpm db:studio` | Launch Prisma Studio |

## Database (`@hackuta/db`)

SQLite database lives under `packages/db/dev.db` (ignored by Git). Schema is in `packages/db/prisma/schema.prisma` with `User` and `Post` models.

Environment file (already created): `packages/db/.env`
```
DATABASE_URL="file:./dev.db"
```

After changing the schema:
```cmd
pnpm db:generate
pnpm db:migrate
```

Open data browser:
```cmd
pnpm db:studio
```

## Development Workflows

### Start Everything
```cmd
pnpm dev
```

### Only Web
```cmd
pnpm turbo run dev --filter=web
```

### Only API
```cmd
pnpm --filter api dev
```

### Add a New Migration with a Name
```cmd
pnpm --filter @hackuta/db exec prisma migrate dev --name add_something
```

## Project Layout
```
apps/
	web/        # Next.js app
	api/        # Express server
packages/
	ui/         # Shared React components
	db/         # Prisma + SQLite (User, Post)
	eslint-config/
	typescript-config/
```

## Troubleshooting
| Issue | Fix |
|-------|-----|
| Prisma client not found | Run `pnpm db:generate` |
| Migration failure | Delete `dev.db` (dev only) then rerun `pnpm db:migrate` |
| API can’t connect | Ensure `.env` exists inside `packages/db` |
| ESM import path errors | Use explicit `.js` extensions when importing compiled TS in NodeNext mode |

## License
MIT — adapt freely.

---
Happy hacking! 🚀
