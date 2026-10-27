# Turntable and Records Price Tracker

A TypeScript and Playwright automation project that monitors product prices across online retailers, records price history, and sends results to Google Sheets.

The project currently tracks the Audio-Technica AT-LP70X-BZ turntable and Sonos Era 100 wireless speaker, with support for additional products and retailers through a configurable JSON data file.

## Features

- **Automated price extraction:** Uses Playwright to visit retailer product pages and extract current prices.
- **Multiple retailers:** Checks configured retailers for each product.
- **Target price monitoring:** Compares extracted prices against configurable target prices.
- **Local price history:** Records successful price checks in a CSV file.
- **Google Sheets integration:** Sends price records to the appropriate spreadsheet tab through Google Apps Script.
- **Cross-browser testing:** Supports Chromium, Firefox, and WebKit through Playwright.
- **Reusable price extraction:** Uses a shared utility to extract prices from product metadata and structured data.
- **Configurable products:** Stores product and retailer information separately from the test code.
- **Automated execution:** Supports scheduled and manual runs through GitHub Actions.
- **Credential protection:** Uses environment variables and GitHub Actions secrets for Google Sheets configuration.

## Tech Stack

- TypeScript
- Playwright Test
- Node.js
- npm
- Google Apps Script
- Google Sheets
- GitHub Actions
- JSON and CSV

## Project Structure

```text
price-tracker/
├── .github/
│   └── workflows/
│       └── price-tracker.yml
├── data/
│   ├── products.json
│   └── price-history.csv
├── tests/
│   ├── turntable-price.spec.ts
│   └── speaker-price.spec.ts
├── utils/
│   ├── google-sheets.ts
│   ├── price-extractor.ts
│   └── price-history.ts
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

Note: `data/price-history.csv` is generated locally and excluded from Git. It may not exist when cloning the repository.

## Prerequisites

Install the following before running the project:

- Node.js 22 or later
- npm
- Git
- A Google account, if using Google Sheets integration

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/rohan-ailani/price-tracker.git
cd price-tracker
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Install Playwright browsers

```bash
npx playwright install
```

For Linux environments, such as GitHub Actions, install the required browser dependencies with:

```bash
npx playwright install --with-deps
```

### 4. Configure environment variables

Create a local `.env` file in the project root using `.env.example` as a template.

```env
GOOGLE_SHEETS_WEB_APP_URL=your_google_apps_script_web_app_url
PRICE_TRACKER_SECRET=your_shared_secret
```

Replace the placeholder values with the deployed Google Apps Script web app URL and the shared secret configured in Apps Script.

**Security:** Never commit `.env` or share its contents. The `.env.example` file should contain placeholders rather than actual credentials.

## Product Configuration

Products and retailers are configured in `data/products.json`.

The current products and target prices are:

| Product | Target price |
|---|---:|
| Audio-Technica AT-LP70X-BZ turntable | CAD $300 |
| Sonos Era 100 wireless speaker, black | CAD $250 |

Retailer entries include a name, product URL, and enabled flag. Set `enabled` to `false` to temporarily exclude a retailer from checks.

To add a retailer:

1. Open `data/products.json`.
2. Find the appropriate product entry.
3. Add the retailer name, product URL, and enabled flag using the existing JSON structure.
4. Run the relevant test locally to verify that the page is accessible and the correct price is extracted.

Ensure that each retailer listing matches the exact product and variant being monitored. For example, the standard Sonos Era 100 and Era 100 SL should be treated as separate products.

Some retailers may block automated requests or return different responses in local and cloud environments. A successful local test does not guarantee that a retailer will be accessible through GitHub Actions.

## Running the Price Tracker

Run the turntable price checks using WebKit:

```bash
npx playwright test tests/turntable-price.spec.ts --project=webkit
```

Run the speaker price checks using WebKit:

```bash
npx playwright test tests/speaker-price.spec.ts --project=webkit
```

Run all configured product tests using WebKit:

```bash
npx playwright test --project=webkit
```

List discovered tests without executing them:

```bash
npx playwright test --list
```

## Price History

Successful price extractions are recorded in the local CSV history file:

```text
data/price-history.csv
```

Each record includes:

- Check timestamp
- Product ID and name
- Retailer
- Product URL
- Extracted price and currency
- Target price
- Whether the target price was met

The CSV file is excluded from Git to avoid committing generated data. Back it up separately if you want to preserve local history.

## Google Sheets Integration

The tracker sends valid price records to a Google Sheet through a deployed Google Apps Script web app.

The spreadsheet uses separate tabs for each product category:

- `Turntable Price History`
- `Speaker Price History`
- `Record Price History`

The integration appends price records to the appropriate tab and initializes the header row if the tab is empty.

The web app URL and shared secret must be configured through environment variables. Apps Script validates the shared secret before writing data, and the destination tab must exist in the spreadsheet.

If a Google Sheets request fails, the test logs the error while preserving the local CSV record.

## GitHub Actions

The workflow is defined in:

```text
.github/workflows/price-tracker.yml
```

It supports scheduled execution and manual runs through the GitHub Actions interface.

The workflow:

1. Checks out the repository.
2. Sets up Node.js.
3. Installs dependencies.
4. Installs Playwright browsers and system dependencies.
5. Runs the configured product test suites using WebKit.
6. Sends valid price records to Google Sheets.

Configure the following repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `GOOGLE_SHEETS_WEB_APP_URL` | Deployed Google Apps Script web app URL |
| `PRICE_TRACKER_SECRET` | Shared secret used to authenticate requests |

To trigger a run manually, open the repository's **Actions** tab, select **Daily Price Tracker**, and choose **Run workflow**.

A push does not automatically trigger a workflow unless a `push` event is configured in the workflow YAML. The scheduled workflow runs according to its configured cron expression, which uses UTC.

## Git and Security

The repository excludes sensitive and generated files through `.gitignore`, including:

- `.env`
- Other `.env.*` files, except `.env.example`
- `node_modules/`
- Playwright test reports and results
- Local price history CSV files

Before committing changes, verify that credentials and private configuration values have not been added to tracked files.

For GitHub Actions, use repository secrets instead of relying on a local `.env` file.

## Future Enhancements

Potential improvements include:

- Adding more Canadian retailers
- Supporting vinyl records and additional products
- Sending notifications when a target price is reached
- Tracking and analyzing historical price trends
- Improving retailer-specific error handling
- Adding duplicate-run protection and more robust reporting

## Disclaimer

This project is intended for personal price monitoring and automation practice. Retailer page structures, pricing formats, and access restrictions may change, requiring updates to the extraction logic. Respect retailer terms of service, access restrictions, and applicable rate limits.
