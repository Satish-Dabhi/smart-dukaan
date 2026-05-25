# SmartDukaan — Project Summary & Architecture Guide

This document provides a highly-dense, comprehensive summary of the **SmartDukaan** codebase. It acts as an immediate reference for developer agents and AI assistants in new chat sessions, eliminating the need to consume tokens by parsing the entire codebase.

---

## 1. Project Overview & Business Logic

**SmartDukaan** ("Smart Shop") is a production-ready, multi-tenant SaaS application designed for local Indian businesses to digitize their operations.

### Key Features

- **Point of Sale (POS) Billing:** High-speed, offline-friendly billing interface supporting custom GST percentages, discounts, and thermal print invoice generation.
- **Dynamic Multi-Tenant Storefronts:** Dynamic public-facing e-commerce storefronts under `/en/business/[slug]` supporting 8 customizable themes (Grocery, Cafe, Bakery, Restaurant, Medical, Salon, Retail, Minimal).
- **GST Invoicing:** Indian GST-compliant invoices splitting taxes into CGST (50% of GST) and SGST (50% of GST) for local/intra-state sales.
- **Inventory Logs:** Real-time stock level monitoring with historical stock logs tracking restocks, sales adjustments, damage, and returns.
- **Customer Loyalty System:** Automatic tracking of purchase history, total spent, and point-based loyalty rewards.
- **Bilingual Interface:** Built-in internationalization (English & Gujarati) powered by `next-intl`.
- **Admin & Super Admin Panels:** Business managers can control their catalog and settings; Super Admins can manage tenants, approve verifications, and monitor platform metrics.

---

## 2. Multi-Tenant Security & Architecture

SmartDukaan enforces robust **data isolation** at the database layer.

- **Tenancy Scoping:** Every document in business-related collections contains a `businessId` field.
- **No Client-Input Trust:** Server Actions and API endpoints **never** accept `businessId` as a request payload. Instead, they extract it directly from the validated JWT session on the server via `auth()` in `src/auth.ts`.
- **Query Scoping Pattern:**

  ```typescript
  // Typical secure server query
  const session = await auth();
  const businessId = session?.user?.businessId;
  if (!businessId) throw new Error("Unauthorized");

  const products = await Product.find({ businessId, ...filters });
  ```

---

## 3. Tech Stack & Key Libraries

| Component                 | Technology / Library              | Usage                                                                  |
| :------------------------ | :-------------------------------- | :--------------------------------------------------------------------- |
| **Framework**             | Next.js 16 (App Router)           | Multi-page routing, Server Components, API routes, and Server Actions  |
| **Database**              | MongoDB + Mongoose                | Document database with rigid ODM schemas and aggregation pipelines     |
| **Security / Auth**       | Auth.js v5 (NextAuth beta)        | Session management, credential login, Google OAuth, and secure JWTs    |
| **Styling**               | Tailwind CSS v4 + Shadcn UI       | Design system primitives, fluid glassmorphism, dynamic themed UI       |
| **Forms & Validation**    | React Hook Form + Zod             | Fully typed inputs, schema validation for billing and product catalogs |
| **State & Data Fetching** | TanStack Query (React Query)      | Server state synchronization, optimistic updates, client caching       |
| **Charts / Analytics**    | Recharts                          | Revenue, orders, and sales category breakdown graphs                   |
| **i18n**                  | `next-intl`                       | Dual-language localization (English: `/en`, Gujarati: `/gu`)           |
| **File Storage**          | Cloudinary                        | Cloud-hosted product images and business assets                        |
| **Email Service**         | Resend & Nodemailer               | Transactional receipts, auth verification, and invoice delivery        |
| **Rate Limiting**         | Upstash Redis + Upstash Ratelimit | Protects APIs from abuse and coordinate locks                          |

---

## 4. Mongoose Database Schemas (`src/models`)

All models are defined in `src/models/` and export standard Mongoose structures. Below are the core schemas:

### A. User (`User.ts`)

Tracks system users (Super Admins, Business Owners, Staff, Customers).

- `name` (String, required)
- `email` (String, unique, required)
- `password` (String, required for credentials provider)
- `role` (`"super_admin" | "business_owner" | "staff" | "customer"`, default `"business_owner"`)
- `businessId` (ObjectId ref: `Business`, optional)
- `isVerified` (Boolean, default `false`)

### B. Business (`Business.ts`)

Represents a shop/tenant.

- `name`, `slug` (String, unique & required - determines public storefront URL)
- `ownerId` (ObjectId ref: `User`, required)
- `theme` (`"grocery" | "cafe" | "bakery" | "restaurant" | "medical" | "salon" | "retail" | "minimal"`)
- `status` (`"active" | "inactive" | "suspended"`, default `"active"`)
- `settings`:
  - `currency` (String, default `"INR"`), `currencySymbol` (String, default `"₹"`)
  - `taxEnabled` (Boolean), `defaultGst` (Number), `invoicePrefix` (String)
  - `loyaltyEnabled`, `onlineOrderEnabled`, `whatsappOrderEnabled` (Booleans)
- `primaryColor`, `secondaryColor`, `fontFamily` (Strings for storefront theme customization)

### C. Product (`Product.ts`)

Item catalog scoped per business.

- `businessId` (ObjectId ref: `Business`, required)
- `name` (English), `nameGu` (Gujarati)
- `price`, `originalPrice`, `discount` (Numbers)
- `sku`, `barcode`, `hsnCode` (Strings, optional)
- `stock` (Number, default `0`), `minStock` (Number, triggers low-stock alerts)
- `status` (`"active" | "inactive" | "out_of_stock"`)
- `isFeatured` (Boolean, for storefront spotlight)
- `unit` (String, e.g. `"kg"`, `"pcs"`, `"ltr"`)

### D. Customer (`Customer.ts`)

Captures customer profiles per business.

- `businessId` (ObjectId ref: `Business`, required)
- `name` (String, required), `phone` (String, required)
- `loyaltyPoints` (Number, default `0`)
- `totalOrders` (Number, default `0`), `totalSpent` (Number, default `0`)

### E. Order & Invoice (`Order.ts`, `Invoice.ts`)

Processes transactions.

- **Order:** Tracks POS, online, or WhatsApp purchases. Captures ordered items (product reference, quantity, unit price, applied discount, and calculated GST), subtotal, total, and statuses.
- **Invoice:** Generates a GST-compliant tax invoice. Automatically separates `cgst` and `sgst` based on `gstPercentage` of individual items. Captures invoice numbers (sequential prefixes), payment methods (`"cash" | "upi" | "card"`), and statuses (`"paid" | "unpaid" | "cancelled"`).

---

## 5. Directory Mapping & Key Entrypoints

```
src/
├── app/
│   ├── [locale]/                 # Dynamic routes wrapped in i18n
│   │   ├── page.tsx              # Application marketing landing page
│   │   ├── auth/                 # Credential/OAuth login & signup forms
│   │   ├── business/[slug]/      # Public client storefront (huge ~54KB client component)
│   │   └── dashboard/            # Business dashboard
│   │       ├── analytics/        # Business intelligence charts
│   │       ├── pos/              # High-efficiency cash register interface
│   │       ├── inventory/        # Stock ledger & restock management
│   │       └── settings/         # Theme & business profile variables
│   └── api/                      # REST endpoints for dashboard & storefront hooks
├── components/
│   ├── pos/                      # POS state controller + invoice print generators
│   ├── storefront/               # Client product browser, cart, & checkout handler
│   ├── dashboard/                # Analytics widgets, product dialogs, sidebars
│   └── shared/                   # Global components (tables, loaders, error boundaries)
├── actions/                      # React Server Actions (database writes)
├── services/                     # Business logic layers abstraction
├── lib/                          # Infrastructure (database connection, Resend, Redis)
└── types/                        # Core TypeScript type models and interfaces
```

---

## 6. Prime Codebase Files & Rationale

When working with SmartDukaan, these are the most critical files to edit or reference:

1. **`src/types/index.ts`**
   - _Why:_ Contains all core TypeScript interfaces (`IBusiness`, `IUser`, `IProduct`, `IInvoice`, `IOrder`, etc.). Check here first before introducing new schemas or editing types.
2. **`src/lib/db.ts`**
   - _Why:_ Mongoose serverless caching connection file. Always ensure database handlers import `connectDB` to maintain stable connection pools in Vercel.
3. **`src/auth.ts` / `src/auth.config.ts`**
   - _Why:_ NextAuth / Auth.js implementation. Handles session callbacks, security parameters, and stores `businessId` in JWT and session payloads.
4. **`src/components/pos/pos-system.tsx`**
   - _Why:_ Contains all client state logic for standard checkout, calculations of discount, dynamic tax distributions (CGST/SGST), barcode parsing, and invoice queuing.
5. **`src/components/storefront/storefront-page.tsx`**
   - _Why:_ Entire storefront interface. Reads business theme settings, applies primary/secondary colors, supports locale switches, manages public shopping cart, and compiles WhatsApp order link payloads.

---

## 7. Developer Cheatsheet

### Core Commands

- `npm run dev`: Launch developer workspace server
- `npm run build`: Compile and validate code for production bundler
- `npm run seed`: Populate database with sample businesses (`fresh-mart` and `mocha-cafe`) and user profiles for testing
- `npm run type-check`: Confirm TypeScript safety across both Server Actions and Client Components

### Calculations & GST Helper Logic

When invoicing items:

- $\text{Taxable Amount} = \text{Price} \times \text{Quantity} - \text{Discount}$
- $\text{Total GST Amount} = \text{Taxable Amount} \times \frac{\text{GST \%}}{100}$
- $\text{CGST} = \frac{\text{Total GST Amount}}{2}$, $\text{SGST} = \frac{\text{Total GST Amount}}{2}$ (for intra-state trade)
