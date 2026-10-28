# Price Tracker

A TypeScript and Playwright project that monitors product prices across Canadian retailers, records price history, and tracks prices against personal target prices using Google Sheets.

The tracker currently covers a turntable, a Sonos speaker, and a collection of vinyl records. GitHub Actions runs the checks automatically, with support for manual workflow runs.

## Features

- **Automated price tracking:** Checks configured products across supported retailers.
- **Multiple product categories:** Tracks turntables, speakers, and vinyl records.
- **Multi-retailer comparison:** Identifies the lowest recorded price for each product.
- **Target price monitoring:** Compares current prices against configured target prices.
- **Price history:** Records price observations, retailer details, product URLs, and target-price status.
- **Google Sheets integration:** Stores price history and displays a dashboard.
- **Scheduled execution:** Runs through GitHub Actions, with manual execution available from the Actions tab.
- **Playwright WebKit:** Uses WebKit to run the browser-based price checks.

## Technology Stack

| Technology         | Purpose                                 |
| ------------------ | --------------------------------------- |
| TypeScript         | Application and test code               |
| Playwright         | Browser automation and price checks     |
| Node.js and npm    | Runtime and dependency management       |
| Google Sheets      | Price history and dashboard             |
| Google Apps Script | Receives and records price observations |
| GitHub Actions     | Scheduled and manual workflow execution |

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
├── utils/
│   ├── google-sheets.ts
│   └── price-history.ts
├── playwright.config.ts
├── package.json
├── package-lock.json
└── README.md
```

_Note: The structure above highlights the main project files. Additional files may exist in the repository._

## Prerequisites

- Node.js 22
- npm
- A Google Sheets spreadsheet configured to receive price observations
- A Google Apps Script web app for recording price history

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rohan-ailani/price-tracker.git
cd price-tracker
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Install the WebKit browser

```bash
npx playwright install webkit
```

On GitHub Actions, the workflow installs the required browser and operating-system dependencies automatically.

### 4. Configure environment variables

Configure the following secrets in your GitHub repository under **Settings → Secrets and variables → Actions**.

| Secret                      | Purpose                                          |
| --------------------------- | ------------------------------------------------ |
| `GOOGLE_SHEETS_WEB_APP_URL` | URL of the Google Apps Script web app            |
| `PRICE_TRACKER_SECRET`      | Secret used to authorize requests to the web app |

Do not commit secret values to the repository.

## Running the Tracker

Run the complete WebKit test suite locally:

```bash
npx playwright test --project=webkit
```

To use a more readable, line-by-line test reporter:

```bash
npx playwright test --project=webkit --reporter=line
```

Run an individual product category:

```bash
# Turntable
npx playwright test tests/turntable-price.spec.ts --project=webkit

# Speakers
npx playwright test tests/speaker-price.spec.ts --project=webkit

# Vinyl records
npx playwright test tests/record-price.spec.ts --project=webkit
```

## GitHub Actions

The workflow is located at `.github/workflows/price-tracker.yml`.

It supports:

- **Scheduled runs:** Automatically checks prices at the configured times.
- **Manual runs:** Can be triggered from the repository's Actions tab using the workflow dispatch option.
- **Automated execution:** Checks out the repository, installs Node.js dependencies, installs Playwright browsers, and runs the WebKit tests.

The schedule is configured in the workflow file. Its timezone is `America/Toronto`, with checks configured for 9:55 AM and 5:55 PM local time.

To inspect a run, open the repository's **Actions** tab and select **Daily Price Tracker**. Expand a failed step to review its logs.

## Google Sheets Integration

The tracker records price observations in separate history tabs:

- **Turntable Price History**
- **Speaker Price History**
- **Record Price History**

The **Price Dashboard** summarizes the latest tracked information, including:

- Product name
- Target price
- Lowest recorded price
- Cheapest retailer
- Difference between the lowest price and target price
- Whether the target price has been met
- Last checked time
- Link to the retailer's product page

Historical observations allow prices to be compared over time rather than relying on a single check.

## Configuring Products

Product information and target prices are maintained in the JSON configuration files under `data/`.

- `data/products.json` contains turntable and speaker product configurations.
- `data/records.json` contains vinyl record configurations.

Each product has a configured target price and retailer information used by the tracker.

To change a target price, update the relevant product entry in the appropriate JSON file, commit the change, and push it to the default branch. The next successful run should record the configured target price with the new observation.

Keep the JSON structure consistent with the existing entries when adding or modifying products.

## Troubleshooting

### Tests pass locally but fail in GitHub Actions

Retailer websites may behave differently when accessed from GitHub-hosted runners. Possible causes include request blocking, page-loading delays, and browser differences.

Check the failed test's log before changing selectors or increasing timeouts. A failure affecting many retailers may indicate a shared environment or network issue.

### Google Sheets is not updated

Verify that:

- `GOOGLE_SHEETS_WEB_APP_URL` is configured correctly.
- `PRICE_TRACKER_SECRET` matches the expected secret.
- The Google Apps Script web app is deployed and accessible.
- The workflow logs do not contain authorization or request errors.

### A product price is missing

Check the retailer page, the price-extraction logic, and the relevant product configuration. Retailer page changes can cause an existing extraction method to stop finding the price.

## Notes

This project is intended for personal price monitoring. Price availability and accuracy depend on retailer websites and the price-extraction methods supported by the tracker.
