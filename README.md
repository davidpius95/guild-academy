# Guild Academy

Guild Academy is the education and talent-development arm of Guild Technologies. This repository contains the Academy marketing website, programme catalogue, admissions journey, evidence library, learner portal preview, and Excel-backed local admissions register.

## Product areas

- Six detailed technical programmes with curriculum, pricing, workload, requirements, and evidence outputs
- Responsive light and dark themes
- Source-linked learner testimonials and alumni outcomes
- Multi-step admissions flow with local progress recovery
- Server-validated application submission to an Excel workbook
- Flutterwave v4 custom tuition checkout with card, virtual account, USSD, OPay, and configurable mobile money
- Server-validated pricing, signed payment sessions, webhook verification, and a private Excel payment register
- Learner portal and partnership experience previews

## Local setup

Requirements: Node.js 20 or newer and pnpm.

```bash
pnpm install
pnpm dev --host 127.0.0.1
```

Open `http://127.0.0.1:5173/`.

## Commands

```bash
pnpm typecheck
pnpm build
pnpm start
```

`pnpm start` serves the production build at `http://127.0.0.1:4173/`.

## Flutterwave checkout

The checkout defaults to safe mock mode. It exercises each payment interface and writes payment events to the private payment register without contacting Flutterwave or moving money.

```text
data/guild-academy-payments.xlsx
```

Copy `.env.example` to a private environment file and configure server-only credentials before sandbox testing. Do not place Flutterwave credentials in any `VITE_` variable because those values are exposed to the browser.

Live mode requires all of the following:

- `FLW_V4_CLIENT_ID`
- `FLW_V4_CLIENT_SECRET`
- `FLW_V4_ENCRYPTION_KEY`
- `FLW_V4_WEBHOOK_SECRET_HASH`
- `FLW_PAYMENT_SESSION_SECRET`
- `FLW_VA_BANK_CODE`
- `PUBLIC_APP_URL` using HTTPS

Live checkout access is also gated by the admissions register. An application must have the review status `Offer`, `Accepted`, or `Payment due`; newly submitted applications cannot pay merely by knowing their reference.

Set the Flutterwave dashboard webhook URL to `https://your-domain.example/api/payments/webhook`. Mobile money stays unavailable until trusted programme prices are supplied through `FLW_MOBILE_MONEY_PRICES_JSON`; the checkout never performs a client-side currency conversion.

The custom card interface sends raw card fields to this application's server for immediate encryption and forwarding. Before enabling live card payments, complete the required Flutterwave merchant approval, PCI DSS scope review, HTTPS deployment, penetration testing, privacy review, and end-to-end sandbox acceptance.

## Admissions workbook

Completed local applications are written to:

```text
data/guild-academy-applications.xlsx
```

The workbook is intentionally ignored by Git because it contains applicant personal data. Set `ADMISSIONS_WORKBOOK_PATH` to use a different private persistent location.

For public serverless hosting, connect the admissions adapter to durable private storage or Microsoft Excel Online/OneDrive. Do not rely on temporary server filesystems for production applicant data.

## Privacy

Never commit applicant workbooks, environment files, credentials, or exported admissions data. The repository ignores these files by default.
