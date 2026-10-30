## Live Price Tracker Dashboard

[![Daily Price Tracker](https://github.com/rohan-ailani/price-tracker/actions/workflows/price-tracker.yml/badge.svg?branch=main)](https://github.com/rohan-ailani/price-tracker/actions/workflows/price-tracker.yml)

View the live Google Sheets dashboard to see the latest prices, 
cheapest retailers, target prices, and historical price tracking.

📊 **[Open Price Tracker Dashboard](https://docs.google.com/spreadsheets/d/1eW5jje0RNJyBb9XYAtpxmoC3ppOva75kEgCYYou5sDg/edit?usp=sharing)**

A TypeScript-based price tracker built with Playwright to monitor product prices across Canadian retailers. The project collects pricing information, records price history locally and in Google Sheets, and runs automatically through GitHub Actions.

## Features

- **Automated price checks:** Uses Playwright to visit retailer product pages and extract pricing information.
- **Multiple product categories:** Tracks turntables, speakers, and vinyl records.
- **Retailer comparison:** Collects prices from supported retailer websites.
- **Currency validation:** Checks that prices are reported in the expected currency, with Canadian dollar support for configured retailers.
- **Price history:** Saves historical pricing data locally and to Google Sheets.
- **Scheduled execution:** Runs automatically through GitHub Actions.
- **Configurable products:** Allows products to be added, updated, or temporarily disabled through JSON configuration files.
- **Failure diagnostics:** Uses Playwright screenshots and traces to help investigate failed tests.

## Tech Stack

- TypeScript
- Playwright
- Node.js
- Google Sheets
- Google Apps Script
- GitHub Actions
- Git and GitHub

## Project Structure

```text
price-tracker/
├── .github/
│   └── workflows/
│       └── price-tracker.yml
├── data/
│   ├── products.json
│   └── records.json
├── tests/
│   ├── record-price.spec.ts
│   ├── speaker-price.spec.ts
│   └── turntable-price.spec.ts
├── playwright.config.ts
├── package.json
├── package-lock.json
└── README.md
```

## How It Works

1. Product information and retailer URLs are maintained in JSON configuration files.
2. Playwright opens the configured product pages using the selected browser.
3. The tests extract available pricing information and relevant currency metadata.
4. The tracker validates the extracted data against the product configuration.
5. Price history is saved locally and submitted to Google Sheets when the integration is configured.
6. GitHub Actions runs the tracker on a schedule and stores test artifacts for troubleshooting.

## Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) (Node.js 22 is used in the GitHub Actions workflow)
- npm
- A GitHub account
- A Google account if using the Google Sheets integration

### 1. Clone the Repository

```bash
git clone https://github.com/rohan-ailani/price-tracker.git
cd price-tracker
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Install Playwright Browsers

To install the browsers used by the project:

```bash
npx playwright install
```

On Linux, you may also need to install operating-system dependencies:

```bash
npx playwright install --with-deps
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
GOOGLE_SHEETS_WEB_APP_URL=your_google_apps_script_web_app_url
PRICE_TRACKER_SECRET=your_shared_secret
```

Replace the placeholder values with your actual configuration.

Keep `.env` out of version control. Do not commit secrets, access tokens, or private deployment URLs to a public repository.

The Google Sheets integration requires the corresponding Google Apps Script deployment to be configured to accept requests from the tracker.

## Running the Tests

### Run All Tests

```bash
npx playwright test
```

### Run Tests in WebKit

WebKit is the browser used by the scheduled GitHub Actions workflow.

```bash
npx playwright test --project=webkit
```

### Run an Individual Test Suite

Track vinyl record prices:

```bash
npx playwright test tests/record-price.spec.ts
```

Track speaker prices:

```bash
npx playwright test tests/speaker-price.spec.ts
```

Track turntable prices:

```bash
npx playwright test tests/turntable-price.spec.ts
```

### View the HTML Report

After a test run, open the Playwright HTML report:

```bash
npx playwright show-report
```

## Product Configuration

Products are configured in the JSON files under `data/`.

- `data/products.json`: Product configuration for the applicable tracked products, including turntables and speakers.
- `data/records.json`: Vinyl record configuration.

The configuration files determine which products are tracked and which retailer product pages are checked. Product entries can be enabled or disabled to control whether they are included in a run.

When adding a product, ensure its configuration includes the fields expected by the relevant test suite, such as the product name, retailer, product URL, expected currency, and target price where applicable. Follow the structure of existing entries.

## Google Sheets Integration

The tracker can submit price data to Google Sheets through a Google Apps Script web app.

The spreadsheet is used to maintain historical pricing information across product categories, with separate tabs for:

- Turntable Price History
- Speaker Price History
- Record Price History

The integration uses the following environment variables:

- `GOOGLE_SHEETS_WEB_APP_URL`
- `PRICE_TRACKER_SECRET`

These values must be configured in the local `.env` file for local runs and as GitHub repository secrets for scheduled runs.

## GitHub Actions

The project uses GitHub Actions to run the price tracker automatically.

The workflow is located at:

```text
.github/workflows/price-tracker.yml
```

The workflow is configured to:

1. Check out the repository.
2. Set up Node.js.
3. Install npm dependencies.
4. Install Playwright browsers and required system dependencies.
5. Run the WebKit price-tracking tests.
6. Upload available test results and reports as workflow artifacts.

The workflow is scheduled to run twice daily using the `America/Toronto` time zone. It can also be started manually from the **Actions** tab in GitHub.

### Workflow Status

The badge at the top of this README displays the status of the `Daily Price Tracker` workflow on the `main` branch.

- **Passing:** The latest applicable workflow run succeeded.
- **Failing:** The latest applicable workflow run failed.
- **No status displayed:** The workflow may not have run yet, or the badge URL or workflow name may need to be checked.

## Troubleshooting

### Missing Google Sheets Environment Variables

If the tracker reports that `GOOGLE_SHEETS_WEB_APP_URL` or `PRICE_TRACKER_SECRET` is missing:

- Confirm that both variables exist in your local `.env` file.
- Confirm that the variable names match exactly.
- For GitHub Actions, confirm that both values are configured under repository **Settings → Secrets and variables → Actions**.
- Confirm that the workflow passes the secrets into the test-running step.

### Price or Currency Validation Failures

Retailer pages may display prices in different currencies depending on their localization settings.

If a test fails:

- Check the retailer page and confirm the displayed currency.
- Verify the expected currency in the product configuration.
- Confirm that the test extracts the correct price and currency metadata.
- Check whether the retailer's page structure or localization controls have changed.

### Failed Playwright Tests

For local debugging, run the affected suite independently:

```bash
npx playwright test tests/record-price.spec.ts --project=webkit
```

Replace the test filename with the relevant suite as needed.

Review the terminal output, Playwright report, screenshots, and traces where available.

## Future Improvements

Potential enhancements include:

- Adding more retailers and products.
- Improving resilience to retailer page changes.
- Adding price-drop notifications.
- Tracking lowest recorded prices and price trends.
- Improving reporting and historical price comparisons.

## Disclaimer

This project is intended for personal price tracking and automation practice. Retailer websites can change their layouts, pricing, availability, and localization behavior at any time. Collected prices may not reflect final checkout prices, shipping costs, taxes, or product availability.
