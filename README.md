# Guild Academy

Guild Academy is the education and talent-development arm of Guild Technologies. This repository contains the Academy marketing website, programme catalogue, admissions journey, evidence library, learner portal preview, and Excel-backed local admissions register.

## Product areas

- Six detailed technical programmes with curriculum, pricing, workload, requirements, and evidence outputs
- Responsive light and dark themes
- Source-linked learner testimonials and alumni outcomes
- Multi-step admissions flow with local progress recovery
- Server-validated application submission to an Excel workbook
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

## Admissions workbook

Completed local applications are written to:

```text
data/guild-academy-applications.xlsx
```

The workbook is intentionally ignored by Git because it contains applicant personal data. Set `ADMISSIONS_WORKBOOK_PATH` to use a different private persistent location.

For public serverless hosting, connect the admissions adapter to durable private storage or Microsoft Excel Online/OneDrive. Do not rely on temporary server filesystems for production applicant data.

## Privacy

Never commit applicant workbooks, environment files, credentials, or exported admissions data. The repository ignores these files by default.
