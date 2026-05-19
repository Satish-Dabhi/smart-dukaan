# SmartDukaan — Your Business, Smarter

A production-ready multi-tenant SaaS platform for Indian local businesses. Built with Next.js 16, TypeScript, MongoDB, and Auth.js v5.

## Features

- **POS Billing** — GST-compliant invoicing with thermal print support
- **Online Storefront** — Mobile-first public store with WhatsApp ordering and QR menus
- **Inventory Management** — Real-time stock tracking with low-stock alerts
- **Analytics Dashboard** — Revenue charts, top products, peak hours, customer growth
- **Customer Management** — Loyalty points, purchase history, contact details
- **Multi-language** — English + Gujarati (next-intl)
- **8 Business Themes** — Grocery, Cafe, Bakery, Restaurant, Medical, Salon, Retail, Minimal
- **PWA Ready** — Installable with offline billing support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | MongoDB + Mongoose |
| Auth | Auth.js v5 (NextAuth beta) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack Query |
| Charts | Recharts |
| i18n | next-intl v4 |
| Images | Cloudinary |
| Email | Resend |
| Rate Limiting | Upstash Redis |

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials (optional)

### Installation

```bash
git clone https://github.com/your-username/smart-dukaan.git
cd smart-dukaan
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Required variables:

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional (enables additional features):

```env
# Google OAuth
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# Cloudinary (image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Resend (transactional email)
RESEND_API_KEY=...
```

### Database Seed

```bash
npm run seed
```

Demo credentials after seeding:

| Account | Email | Password |
|---------|-------|----------|
| Grocery Store | demo@smartdukaan.com | demo1234 |
| Cafe | cafe@smartdukaan.com | demo1234 |

Demo storefronts:
- `http://localhost:3000/en/business/fresh-mart`
- `http://localhost:3000/en/business/mocha-cafe`

### Development

```bash
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx              # Landing page
│   │   ├── auth/                 # Login, register pages
│   │   ├── dashboard/            # Protected dashboard routes
│   │   │   ├── page.tsx          # Overview with analytics
│   │   │   ├── products/         # Product management
│   │   │   ├── categories/       # Category management
│   │   │   ├── pos/              # Point of Sale system
│   │   │   ├── invoices/         # Invoice history + print
│   │   │   ├── orders/           # Order tracking
│   │   │   ├── customers/        # Customer management
│   │   │   ├── inventory/        # Stock management
│   │   │   ├── analytics/        # Charts and reports
│   │   │   ├── qr-codes/         # QR code generator
│   │   │   ├── storefront/       # Storefront link + preview
│   │   │   └── settings/         # Business settings
│   │   └── business/[slug]/      # Public storefront
│   └── api/
│       ├── auth/                 # Auth.js handlers + register
│       ├── products/             # CRUD + search
│       ├── categories/           # CRUD
│       ├── orders/               # Order management
│       ├── invoices/             # Invoice queries
│       ├── customers/            # Customer queries
│       ├── business/             # Business CRUD
│       ├── analytics/            # Aggregation pipelines
│       ├── inventory/            # Stock adjustments
│       └── pos/checkout/         # POS transaction handler
├── components/
│   ├── ui/                       # Design system primitives
│   ├── landing/                  # Marketing page sections
│   ├── auth/                     # Login/register forms
│   ├── dashboard/                # Dashboard page components
│   ├── pos/                      # POS system + invoice print
│   ├── storefront/               # Public storefront UI
│   └── providers/                # React context providers
├── models/                       # Mongoose schemas
├── lib/                          # db, utils, auth helpers
├── i18n/                         # next-intl routing config
├── scripts/                      # Seed script
└── types/                        # Global TypeScript types
```

## Routes

| Route | Description | Auth |
|-------|-------------|------|
| `/en` | Landing page | Public |
| `/en/auth/login` | Login | Public |
| `/en/auth/register` | Register | Public |
| `/en/dashboard` | Analytics overview | Required |
| `/en/dashboard/products` | Product catalog | Required |
| `/en/dashboard/categories` | Category management | Required |
| `/en/dashboard/pos` | Point of Sale | Required |
| `/en/dashboard/invoices` | Invoice history | Required |
| `/en/dashboard/orders` | Order management | Required |
| `/en/dashboard/customers` | Customer list | Required |
| `/en/dashboard/inventory` | Stock management | Required |
| `/en/dashboard/analytics` | Charts & reports | Required |
| `/en/dashboard/qr-codes` | QR code generator | Required |
| `/en/dashboard/storefront` | Storefront link | Required |
| `/en/dashboard/settings` | Business settings | Required |
| `/en/business/[slug]` | Public storefront | Public |

## Multi-Tenant Architecture

Every database query is scoped by `businessId` from the JWT session. No cross-tenant data leakage is possible — all routes extract `businessId` from `auth()` rather than accepting it as user input.

```typescript
const session = await auth();
const businessId = session?.user?.businessId;
// All queries: Model.find({ businessId, ...filters })
```

## GST Calculation

Indian GST is split as CGST (50%) + SGST (50%) for intra-state:

```typescript
calculateGST(amount, gstPercent)
// → { cgst, sgst, igst: 0, total }
```

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run seed         # Seed demo data
npm run type-check   # TypeScript validation
npm run lint         # ESLint
```

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

Set all environment variables in the Vercel project settings.

## License

MIT
