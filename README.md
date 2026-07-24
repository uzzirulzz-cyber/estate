# PropertyAtlas — Real Estate Marketplace & Admin Console

A full-stack real estate platform with a public storefront (properties for sale, rentals, ongoing projects) and a backend admin console (sales, revenue, profit, audit trail, tax & compliance).

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Prisma (SQLite)**, and **TanStack Query**.

## Features

### Storefront (`/`)
- Hero with AI-generated skyline backdrop and a 5-field search card (keyword / listing type / property type / beds / sort)
- Featured properties, all listings, premium rentals, and **ongoing projects** with construction progress bars
- Property detail dialog with stats, amenities, and actions
- Sticky footer, fully responsive

### Admin Console (toggle from storefront nav)
- **Dashboard** — KPI cards, revenue/profit/tax bar chart, revenue-by-type donut, top agents, tax status, portfolio snapshot
- **Properties** — searchable table + full CRUD (Add/Edit/Delete)
- **Sales & Rentals** — transactions table + record-transaction dialog with live commission/tax/profit preview
- **Revenue & Profit** — 6 & 12-month trends, revenue by type, agent performance ledger
- **Tax & Compliance** — by-year liability, settlement breakdown, mark-paid action, CSV export
- **Audit Trail** — immutable filterable log of every create/update/delete/sale/rental/tax action with CSV export

## API (REST)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | List properties (filters: listingType, propertyType, status, city, q, minPrice, maxPrice, beds, sort) |
| POST | `/api/properties` | Create property |
| GET/PUT/DELETE | `/api/properties/[id]` | Read / update / delete a property |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions` | Record a sale/rental (auto-calculates commission, tax, profit) |
| GET | `/api/dashboard/stats` | KPIs, top agents, sales by type |
| GET | `/api/dashboard/chart?months=6` | Monthly revenue/profit/tax/volume series |
| GET | `/api/audit` | Audit log (filters: entity, action) |
| GET | `/api/tax` | Tax report + by-year summary |
| PATCH | `/api/tax/[id]` | Mark a tax record as paid |

## Data Model

- **Property** — listings (sale/rental/project) with type, status, price, location, features
- **Transaction** — sales/rentals with commission, tax, profit, agent, buyer/seller
- **TaxRecord** — per-transaction tax liability (fiscal year, paid/pending)
- **AuditLog** — immutable action log

## Getting Started

```bash
# Install dependencies
bun install

# Set up the database
bun run db:push        # sync Prisma schema to SQLite
bunx tsx prisma/seed.ts  # seed sample data (10 properties, 9 transactions, etc.)

# Start the dev server
bun run dev            # http://localhost:3000
```

Create a `.env` file with:
```
DATABASE_URL=file:./db/custom.db
```

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York)
- **Database**: Prisma ORM + SQLite
- **State**: TanStack Query (server) 
- **Icons**: Lucide React

## License

MIT
