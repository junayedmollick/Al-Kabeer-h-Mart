## Product photos, reviews and verified payments (September 2026)

The catalog importer uses the shop's photos from public/assets/products. Run once after backing up: `node --env-file-if-exists=.env server/import-product-images.js`. It also creates its own SQLite backup and is safe to rerun. Existing stocked products remain available; old unstocked sample products are archived, not deleted. Three category screenshots are excluded and repeated product photos become galleries. Imported items have no invented prices or stock: use Admin → Products to confirm the name/pack size, set a price, stock and description. A valid selling price clears the price-pending flag. Product detail pages support buying and one editable review per customer; a verified-purchase badge requires a delivered order containing that product. Profile photos are resized in the browser, stored in SQLite and served only to the signed-in owner.

### Enable UPI and card payments

1. Copy .env.example to .env if it does not exist. Set CHECKOUT_PAYMENT_MODE=online (the default). Keep secret keys out of Git and browser code.
2. Complete your Razorpay merchant setup. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET locally. Start with test keys on a local/staging store. No real online payments are available until keys are configured.
3. Set APP_ORIGIN to the store's public HTTPS address for production. Configure the Razorpay webhook URL as https://YOUR-STORE/api/payments/webhook with the same webhook secret; subscribe to payment.captured and refund.processed. Configure automatic capture in Razorpay.
4. Restart the API. Test success, dismissal, failure, duplicate callback, expired reservation and refund flows in test mode. Then use live keys for production; test keys are rejected in production.

Customers choose COD, UPI or card. COD is collected by the delivery person and recorded on delivery. UPI/card open Razorpay checkout before WhatsApp; the server checks the signature, provider status, amount, currency and selected method. Only captured verified payments become Paid. A dismissed payment stays Pending and can be retried from its saved confirmation or My Orders. No card number, CVV, OTP or UPI PIN is stored by this application. Online methods are visibly unavailable until setup is complete. Refund-required orders still require the merchant to initiate a refund in Razorpay; the signed webhook updates the result.

The older preference-mode setting remains only for existing installations/history. It does not verify payments and should not be used for the current store.

---

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
- Admin sign-in: http://127.0.0.1:3000/admin/login
- API health: http://127.0.0.1:4000/api/health
- `npm run dev` runs both the API and Vite. Stop with Ctrl+C.
- Use **127.0.0.1**, matching the configured APP_ORIGIN, when running Vite locally.

The first administrator is `admin@alkabeerhmart.com`. When no ADMIN_PASSWORD is provided, `npm run admin:create` generates a random password and saves it to **data/admin-credentials.txt**. This private file and the database are excluded from Git. Existing credentials are never overwritten. Change the password in Admin → Settings → Account or My Account → Account Settings.

To supply credentials yourself, set ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD in your environment before running the command. ADMIN_PASSWORD must have at least 12 characters. Customer registration always creates a customer, never an administrator.

## Before accepting real orders

1. Sign into the admin and enter **actual stock and prices**. The existing 70 sample products and 16 categories are imported once. Stock starts at **zero** because the frontend had no verified inventory. Demo customers, orders and promotions are not imported.
2. Review Settings → General: delivery fee, minimum order, service pincodes, contact details and whether the store accepts orders. Initial delivery fee is ₹10 and the initial service pincode is 712701, taken from the existing frontend.
3. Create a customer account and place a cash-on-delivery order. Check it in Admin → Orders.
4. Privacy Policy and Terms of Service pages are available at `/privacy-policy` and `/terms-of-service` and linked from the footer and checkout. They describe the implemented service and use the store contact settings. Confirm the store's legal identity, contact information and operational policies before a public launch; these pages are not a certification of legal compliance. Review the existing marketing claims and sample product images as well.

## Implemented flows

- Email/phone and password registration, sign-in, server-side sessions, sign-out, profile updates, saved addresses and password changes.
- Protected admin routes and server-side role checks on every admin API.
- Products and categories: create, update and delete; shared catalog for search, browsing and checkout. Categories containing products cannot be deleted.
- Inventory revisions prevent stale admin edits from overwriting stock changed by an order. Close and reopen a form after a conflict.
- Three payment options: COD, UPI and card. COD is collected on delivery; UPI/card require configured Razorpay checkout and server verification. Server-calculated prices, delivery fees, minimum order, service area and coupon validation apply to every method.
- **Place order & continue to WhatsApp** saves the order, replaces the checkout URL with a persistent confirmation URL, and opens WhatsApp automatically in the same tab. Returning shows **Order Placed Successfully!**, including after a reload, without submitting another order. The confirmation has no Send order on WhatsApp button; My Orders retains one for retries. The formatted message includes the order number, time, customer contact, address, item quantities, pack sizes, unit prices, discounts, delivery fee, total and payment preference/status. Customers still tap Send inside WhatsApp; the website cannot confirm that a chat message was sent.
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

## Legacy payment preferences

Legacy installations may use `CHECKOUT_PAYMENT_MODE=preference`; the current default is online. Customers can select all three methods without making a website payment. New orders are Unpaid; selecting UPI/card cannot mark them paid and does not open a payment gateway. These orders do not have the gateway's 30-minute payment deadline. Administrators can dispatch preference orders and record a payment received externally using a receipt reference and explicit verification checkbox in Admin → Orders → Receipt. This only records the transaction; it never charges a customer. UPI/card delivery does not automatically mark the payment as received.

For a cancelled order previously recorded as Paid, the status becomes Refund required. After completing the refund outside the website, record its reference in the same receipt. Customer accounts cannot record payment or refund confirmations.

## UPI and online card setup (Razorpay)

For verified online collection, set `CHECKOUT_PAYMENT_MODE=online`; **real payments require your own activated Razorpay merchant account and keys**. Payment tests use an isolated provider stub and genuine HMAC signatures; they are not proof of a live bank transaction.

1. Copy `.env.example` to `.env` if it does not exist. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` on the server. Use Razorpay test keys first. Never put a secret in a `VITE_` variable or commit `.env`.
2. Configure Razorpay to **automatically capture** payments. The store only marks a matching captured payment as Paid, after checking its amount, currency, order and method.
3. Configure the HTTPS webhook URL `https://your-store-domain/api/payments/webhook`, subscribe to `payment.captured` and `refund.processed`, and use the same webhook secret as the server. A public HTTPS test endpoint is needed for local webhook tests.
4. Restart the API after changing configuration. Verify both UPI and card in test mode, including closing the payment window, failed payments, successful payments, duplicate webhooks, cancellations and refunds. Admin → Settings displays payment readiness; test mode is clearly labelled at checkout.
5. After merchant activation and successful end-to-end testing, replace test credentials with live credentials and verify the live webhook setup. Production rejects test keys.

Online checkout saves the order, opens secure payment, verifies it, then opens WhatsApp. Payment can also be retried from the saved confirmation or My Orders. A cancelled payment window leaves a retry button. Pending online orders reserve stock for **30 minutes**; expired reservations are cancelled and stock is restored on the next API request, including after a restart. A webhook confirms payments even when the browser is closed. Unpaid online orders cannot be dispatched.

Cancelling a paid order records **Refund required**, without pretending money has been returned. Issue the refund from Razorpay using the payment ID shown in the admin receipt. A signed `refund.processed` webhook and a provider API check update the order to Refunded or Partially refunded. Late captures on cancelled orders also require a refund. Review these orders in Admin → Orders. Refunds are not automatically initiated by this app.

Integration references: [Razorpay checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/), [payment-method configuration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/), [webhook verification](https://razorpay.com/docs/webhooks/validate-test/).

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
| POST | `/api/auth/admin/login` | Administrator credentials only |
| GET | `/api/auth/me` | Current session or null |
| PATCH | `/api/account` | Customer/admin |
| PUT | `/api/account/addresses` | Current account |
| POST | `/api/account/password` | Current account + current password |
| GET / POST | `/api/orders` | Current account; POST needs `Idempotency-Key` |
| POST | `/api/orders/quote` | Signed in |
| POST | `/api/orders/:id/cancel` | Order owner |
| GET | `/api/orders/:id` | Order owner; supports confirmation reloads |
| PATCH | `/api/admin/orders/:id/payment-record` | Admin; verified external payment/refund reference |
| POST | `/api/orders/:id/payment/start`, `/api/orders/:id/payment/verify` | Order owner |
| POST | `/api/payments/webhook` | Verified Razorpay signature; no browser session |
| GET | `/api/admin/data` | Admin |
| GET / POST | `/api/admin/products`, `/api/admin/categories`, `/api/admin/promotions` | Admin |
| PUT / DELETE | `/api/admin/products/:id`, `/api/admin/categories/:id`, `/api/admin/promotions/:id` | Admin; PUT requires current revision |
| PATCH | `/api/admin/orders/:id/status` | Admin |
| PUT | `/api/admin/settings`, `/api/admin/notifications/preferences` | Admin |

## Services not connected

Razorpay online collection needs merchant credentials and end-to-end provider testing before real use. SMS/email verification and password-reset delivery, automatic WhatsApp message sending, courier integration, GPS dispatch and paid VIP enrolment are not connected. COD and customer-sent WhatsApp orders work without those services. Product images use HTTPS URLs or files in `public`; product photos use local paths or HTTPS URLs; customer profile-photo upload is available.

No public hosting account, domain, paid service or production deployment has been created by this implementation.

### Implementation references

- [Node.js SQLite API](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html)
- [Node.js crypto API](https://nodejs.org/api/crypto.html)

Policy drafting references: [Department of Consumer Affairs rules](https://consumeraffairs.gov.in/pages/consumer-protection-acts), [MeitY data-protection acts and policies](https://www.meity.gov.in/documents/act-and-policies).
