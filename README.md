# Al Kabeer H Mart

React storefront and administrator dashboard with a Node.js API and a persistent SQLite database. Requires **Node.js 24.15 or later**.

## Run locally

```powershell
cd D:\React-project\Al-Kabeer-h-Mart
npm install
npm run admin:create
npm run dev
```

- Store: http://127.0.0.1:3000
- Admin: http://127.0.0.1:3000/admin
- API health: http://127.0.0.1:4000/api/health
- `npm run dev` runs both the API and Vite. Stop with Ctrl+C.
- Use **127.0.0.1**, matching the configured APP_ORIGIN, when running Vite locally.

The first administrator is `admin@alkabeerhmart.com`. When no ADMIN_PASSWORD is provided, `npm run admin:create` generates a random password and saves it to **data/admin-credentials.txt**. This private file and the database are excluded from Git. Existing credentials are never overwritten. Change the password in Admin → Settings → Account or My Account → Account Settings.

To supply credentials yourself, set ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD in your environment before running the command. ADMIN_PASSWORD must have at least 12 characters. Customer registration always creates a customer, never an administrator.

## Before accepting real orders

1. Sign into the admin and enter **actual stock and prices**. The existing 70 sample products and 16 categories are imported once. Stock starts at **zero** because the frontend had no verified inventory. Demo customers, orders and promotions are not imported.
2. Review Settings → General: delivery fee, minimum order, service pincodes, contact details and whether the store accepts orders. Initial delivery fee is ₹10 and the initial service pincode is 712701, taken from the existing frontend.
3. Create a customer account and place a cash-on-delivery order. Check it in Admin → Orders.
4. For a public launch, review the existing marketing claims, replace sample product images where needed, and supply the store's actual privacy, terms, cancellation and delivery policies. Existing frontend policy links are still placeholders.

## Implemented flows

- Email/phone and password registration, sign-in, server-side sessions, sign-out, profile updates, saved addresses and password changes.
- Protected admin routes and server-side role checks on every admin API.
- Products and categories: create, update and delete; shared catalog for search, browsing and checkout. Categories containing products cannot be deleted.
- Inventory revisions prevent stale admin edits from overwriting stock changed by an order. Close and reopen a form after a conflict.
- Cash-on-delivery checkout with server-calculated prices, delivery fees, minimum order, service area and coupon validation. Price changes require the customer to review the new total.
- Atomic inventory deduction, order snapshots, idempotency keys for duplicate submission protection, and stock restoration on cancellation.
- Order progression: Processing → Out for Delivery → Delivered. Processing and Out for Delivery may be cancelled by an admin; customers can cancel only Processing orders. Delivered and Cancelled are final states. COD is marked Collected when delivered.
- Customer orders refresh every 10 seconds; catalog every 15 seconds; admin data every 10 seconds. Reloads and server restarts preserve data.
- Admin customers, dashboard metrics, charts, low-stock alerts and order notifications use recorded data. Notification read/dismiss preferences persist per administrator.
- Coupons: fixed or percentage discounts, minimum spend, expiry, usage limits and cancellation restoring usage. Enter `10% OFF` for a percentage coupon or `₹50 OFF` for a fixed amount.
- Admin settings control delivery and checkout. Store contact details appear in the footer and account support section.

The cart and language preference stay in browser storage. Authentication, orders, addresses, catalog, coupons and settings are stored on the server. Old demo localStorage data is not migrated into real accounts.

## Validation

```powershell
npm test
npm run build
```

Integration tests use their own temporary database and cover authorization, password hashing, session invalidation, origin checks, catalog writes, server pricing, invalid orders, order ownership, duplicate requests, concurrent stock exhaustion, cancellation, coupons, settings and persistence across reopening the database.

## Deployment and backups

This backend needs a **persistent Node.js service and disk**. A static frontend deployment alone cannot run it, and an ephemeral serverless filesystem must not hold the SQLite database. The existing `.vercel` folder is not a backend deployment.

For a small single-store deployment, run one Node.js service behind an HTTPS reverse proxy, with a persistent volume mounted at `/data`. Build with `npm ci && npm run build`, then run `npm start`. Set:

```dotenv
NODE_ENV=production
HOST=0.0.0.0
PORT=4000
APP_ORIGIN=https://your-store-domain.example
DATABASE_PATH=/data/store.sqlite
```

The API serves the built frontend from `dist`, so the store and API use the same origin. HTTPS is required for production session cookies. Restrict direct access to the origin server to your reverse proxy. Authentication attempts are limited per connection IP; the app deliberately does not trust arbitrary forwarded IP headers. Behind a proxy this limit is shared unless an additional trusted proxy rate-limit setup is configured.

Back up the database while the app is running:

```powershell
node --env-file-if-exists=.env server/backup.js
```

Backups default to `data/backups`; an optional directory argument chooses another destination. Copy backups to separate protected storage and test restoration. To restore, stop the app, keep a copy of the current database and its WAL/SHM sidecars, replace the database with a verified backup, remove only obsolete sidecars belonging to that replaced database, then restart.

## API overview

All mutation requests accept JSON. Browser requests use an HttpOnly session cookie. Cross-origin mutations are rejected. Errors are `{ "error": "message" }`.

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/health`, `/api/catalog` | Public |
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | Public/session |
| GET | `/api/auth/me` | Current session or null |
| PATCH | `/api/account` | Customer/admin |
| PUT | `/api/account/addresses` | Current account |
| POST | `/api/account/password` | Current account + current password |
| GET / POST | `/api/orders` | Current account; POST needs `Idempotency-Key` |
| POST | `/api/orders/quote` | Signed in |
| POST | `/api/orders/:id/cancel` | Order owner |
| GET | `/api/admin/data` | Admin |
| GET / POST | `/api/admin/products`, `/api/admin/categories`, `/api/admin/promotions` | Admin |
| PUT / DELETE | `/api/admin/products/:id`, `/api/admin/categories/:id`, `/api/admin/promotions/:id` | Admin; PUT requires current revision |
| PATCH | `/api/admin/orders/:id/status` | Admin |
| PUT | `/api/admin/settings`, `/api/admin/notifications/preferences` | Admin |

## Services not connected

Online payments, SMS/email verification and password-reset delivery, WhatsApp automation, courier integration, GPS dispatch and paid VIP enrolment are not connected. COD works without those services. VIP self-activation and fake online payment forms have been removed. WhatsApp support links only open a conversation when clicked; orders do not depend on WhatsApp. Product images currently use HTTPS URLs or files in `public`; there is no image upload service.

No public hosting account, domain, paid service or production deployment has been created by this implementation.

### Implementation references

- [Node.js SQLite API](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html)
- [Node.js crypto API](https://nodejs.org/api/crypto.html)
