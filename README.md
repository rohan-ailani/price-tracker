# Turntable and Records Price Tracker

A TypeScript and Playwright automation project that monitors product prices across online retailers, records price history, and sends results to Google Sheets.

The project currently tracks the Audio-Technica AT-LP70X-BZ turntable, with a target price of CAD $300. It is designed to support additional retailers and products through a configurable JSON data file.

## Features

- **Automated price extraction:** Uses Playwright to visit retailer product pages and extract current prices.
- **Multiple retailers:** Currently configured for Sonic Boom Music and Bay Bloor Radio.
- **Target price monitoring:** Compares extracted prices against a configurable target price.
- **Local price history:** Records price checks in a CSV file.
- **Google Sheets integration:** Sends price records to a Google Sheet through Google Apps Script.
- **Cross-browser testing:** Supports Chromium, Firefox, and WebKit through Playwright.
- **Configurable products:** Stores product and retailer information separately from the test code.
- **Credential protection:** Uses environment variables for Google Sheets configuration.

## Tech Stack

- TypeScript
- Playwright Test
- Node.js
- npm
- Google Apps Script
- Google Sheets
- JSON and CSV

## Project Structure

```text
price-tracker/
├── data/
│   ├── products.json
│   └── price-history.csv
├── tests/
│   └── turntable-price.spec.ts
├── utils/
│   ├── google-sheets.ts
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

- Node.js
- npm
- Git
- A Google account, if using Google Sheets integration

## Installation

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd price-tracker
```

Replace the placeholder with your GitHub repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install
```

### 4. Configure environment variables

Create a local `.env` file in the project root using `.env.example` as a template.

```text
GOOGLE_SHEETS_WEB_APP_URL=your_google_apps_script_web_app_url
PRICE_TRACKER_SECRET=your_shared_secret
```

Replace the placeholder values with your own configuration.

**Security:** Never commit `.env` or share its contents. The `.env.example` file contains blank values and can safely be committed.

## Product Configuration

Products and retailers are configured in `data/products.json`.

The current configuration tracks the Audio-Technica AT-LP70X-BZ with a target price of CAD $300.

Retailer entries include a name, product URL, and enabled flag. Set `enabled` to `false` to temporarily exclude a retailer from checks.

To add a retailer, add its product URL and configuration to the appropriate product entry. Ensure the listing matches the exact product variant you want to monitor.

## Running the Price Tracker

Run the turntable price test using WebKit:

```bash
npx playwright test tests/turntable-price.spec.ts --project=webkit
```

Run the test using Chromium:

```bash
npx playwright test tests/turntable-price.spec.ts --project=chromium
```

Run the test using Firefox:

```bash
npx playwright test tests/turntable-price.spec.ts --project=firefox
```

Run all configured Playwright projects:

```bash
npx playwright test
```

List discovered tests without executing them:

```bash
npx playwright test --list
```

## Price History

Each successful price extraction is recorded in the local CSV history file:

```text
data/price-history.csv
```

The history includes fields such as:

- Check timestamp
- Product ID and name
- Retailer
- Product URL
- Extracted price and currency
- Target price
- Whether the target was met

The CSV file is excluded from Git to avoid committing generated data. Back it up separately if you want to preserve local history.

## Google Sheets Integration

The tracker can send extracted prices to a Google Sheet using a deployed Google Apps Script web app.

The integration expects the destination spreadsheet to contain a tab named:

`Turntable Price History`

The script appends price records and initializes the header row if the sheet is empty.

The integration requires the web app URL and shared secret to be configured as environment variables. The Apps Script must use the matching secret and be deployed with suitable access settings.

If the Google Sheets request fails, the test logs the error while preserving the local CSV record.

## GitHub and Secrets

The repository excludes sensitive and generated files through `.gitignore`, including:

- `.env`
- Other `.env.*` files, except `.env.example`
- `node_modules/`
- Playwright test reports and results
- Local price history CSV files

Before committing changes, verify that no credentials or private URLs have been hard-coded into source files.

For future scheduled runs through GitHub Actions, configure the required environment variables as GitHub repository or environment secrets rather than relying on a local `.env` file.

## Future Enhancements

Potential improvements include:

- Adding more Canadian retailers
- Supporting multiple products and accessories
- Scheduling automatic price checks with GitHub Actions
- Sending notifications when a target price is reached
- Tracking price changes over time
- Improving retailer-specific price extraction and error handling
- Adding duplicate-run protection and more robust reporting

## Disclaimer

This project is intended for personal price monitoring and automation practice. Retailer page structures and pricing formats may change, requiring updates to the extraction logic. Respect retailer terms of service, access restrictions, and applicable rate limits.
