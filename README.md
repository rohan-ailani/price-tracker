# Price Tracker

## Live Price Tracker Dashboard

[![Daily Price Tracker](https://github.com/rohan-ailani/price-tracker/actions/workflows/price-tracker.yml/badge.svg)](https://github.com/rohan-ailani/price-tracker/actions/workflows/price-tracker.yml)

View the live Google Sheets dashboard to see the latest prices, cheapest retailers, target prices, and historical price tracking.

📊 **[Open Price Tracker Dashboard](https://docs.google.com/spreadsheets/d/1eW5jje0RNJyBb9XYAtpxmoC3ppOva75kEgCYYou5sDg/edit?usp=sharing)**

A TypeScript-based price tracking application built with Playwright to monitor products across Canadian retailers. The application automatically collects product prices, validates currencies, records historical pricing in Google Sheets, and sends email notifications when subscribed products reach their target prices.

Price checks run locally or automatically through GitHub Actions.

---

## Features

### Automated Price Tracking

- Uses Playwright to visit configured retailer product pages.
- Tracks three product categories: turntables, speakers, and vinyl records.
- Compares prices across supported Canadian retailers.
- Extracts and validates prices and currency information.
- Records price history locally and in Google Sheets.
- Supports enabling and disabling individual products through JSON configuration.

### Price Alerts and Subscriptions

- Allows users to subscribe to price alerts for selected products.
- Supports suggested target prices and custom target prices.
- Sends email verification links when a subscriber registers.
- Activates subscriptions after email verification.
- Sends email notifications when a product reaches or drops below the subscriber's target price.
- Includes unsubscribe links in notification emails.
- Prevents duplicate notifications while a product remains at or below the target price.
- Resets alert status when the price rises above the target, allowing a future price drop to trigger another notification.

### Google Sheets Integration

- Stores historical prices in Google Sheets.
- Maintains a separate product catalogue.
- Separates subscriber information and alert records into a private workbook.
- Uses Google Apps Script to process incoming price data, subscriptions, and email notifications.

### Continuous Integration

- Runs scheduled price checks through GitHub Actions.
- Uses WebKit for scheduled execution.
- Supports manual workflow execution.
- Uploads available Playwright test results and reports for troubleshooting.

---

## Tech Stack

| Technology         | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| TypeScript         | Application and test code                          |
| Playwright         | Browser automation and price extraction            |
| Node.js            | Runtime environment                                |
| Google Sheets      | Price history and data storage                     |
| Google Apps Script | Backend processing, subscriptions and email alerts |
| GitHub Actions     | Scheduled test execution and CI                    |
| dotenv             | Local environment configuration                    |
| Prettier           | Code formatting                                    |
| Git and GitHub     | Version control                                    |

---

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
├── .env.example
├── .gitignore
├── .prettierrc.json
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

---

## How It Works

The price tracking process follows these steps:

1. Product information, target prices, and retailer URLs are maintained in JSON configuration files.
2. Playwright opens the configured retailer product pages using the selected browser.
3. The tests extract available pricing information and currency metadata.
4. Extracted prices are validated against the product configuration.
5. Price history is recorded and submitted to the Google Apps Script web app.
6. Google Apps Script validates the incoming request and saves the price record to the appropriate Google Sheets tab.
7. The Apps Script backend checks active subscriptions against the latest price.
8. If a product meets a subscriber's target price, an email notification is sent.
9. GitHub Actions runs the price tracker automatically on its configured schedule.

---

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js (Node.js 22 is used in GitHub Actions)
- npm
- Git
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

```bash
npx playwright install
```

On Linux, you may also need to install operating system dependencies:

```bash
npx playwright install --with-deps
```

### 4. Configure Environment Variables

Create a `.env` file in the project root using the example configuration:

```bash
cp .env.example .env
```

Configure the following variables:

```env
GOOGLE_SHEETS_WEB_APP_URL=your_google_apps_script_web_app_url
PRICE_TRACKER_SECRET=your_shared_secret
```

| Variable                    | Description                                                                    |
| --------------------------- | ------------------------------------------------------------------------------ |
| `GOOGLE_SHEETS_WEB_APP_URL` | Google Apps Script web app endpoint used to submit price data                  |
| `PRICE_TRACKER_SECRET`      | Shared secret used to authenticate requests between Playwright and Apps Script |

Keep `.env` out of version control. Never commit secrets, access tokens, private spreadsheet IDs, or sensitive deployment information.

The Google Sheets integration requires a deployed Google Apps Script web app configured to accept requests from the tracker.

---

## Running the Tests

### Run All Tests

```bash
npx playwright test
```

Or use the npm script:

```bash
npm test
```

### Run All Tests in WebKit

WebKit is the browser used by the scheduled GitHub Actions workflow.

```bash
npx playwright test --project=webkit
```

### Run Individual Test Suites

**Turntable price tracking**

```bash
npx playwright test tests/turntable-price.spec.ts
```

**Speaker price tracking**

```bash
npx playwright test tests/speaker-price.spec.ts
```

**Vinyl record price tracking**

```bash
npx playwright test tests/record-price.spec.ts
```

To run an individual suite using WebKit:

```bash
npx playwright test tests/speaker-price.spec.ts --project=webkit
```

Replace the filename with the relevant test suite.

### View the Playwright Report

```bash
npx playwright show-report
```

The HTML report provides details about test execution, including passed tests, failed tests, and available diagnostic information.

---

## Product Configuration

Products are configured through JSON files in the `data/` directory.

| File                 | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `data/products.json` | Product configuration for tracked turntables and speakers |
| `data/records.json`  | Vinyl record configuration                                |

The configuration files determine which products are tracked and which retailer product pages are checked.

Product entries can be enabled or disabled to control whether they are included in a run.

When adding a product, follow the structure of existing entries and include the fields required by the relevant test suite, such as:

- Product ID
- Product name
- Retailer
- Product URL
- Expected currency
- Target price, where applicable
- Enabled status

Disabled products are excluded from scheduled tracking runs.

---

## Google Sheets Architecture

The project uses two separate Google Sheets workbooks to organize price tracking data and protect subscriber information.

### 1. Price Tracker Workbook

The original workbook stores product information and historical pricing data.

| Sheet                     | Purpose                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `Turntable Price History` | Historical turntable prices                                    |
| `Speaker Price History`   | Historical speaker prices                                      |
| `Record Price History`    | Historical vinyl record prices                                 |
| `Products`                | Product catalogue, target prices, currencies and active status |

The `Products` sheet is also used by the subscription system to retrieve available products and their suggested target prices.

### 2. Subscriber, Subscription and Alerts Workbook

A separate private workbook stores subscriber information and notification records.

| Sheet           | Purpose                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| `Subscribers`   | Subscriber email addresses, verification tokens and verification status       |
| `Subscriptions` | Product subscriptions, target prices, currencies and active status            |
| `Alert Log`     | Historical record of successfully sent price alert emails                     |
| `Alert State`   | Tracks whether an alert has already been sent for a subscription and retailer |

Subscriber information is kept separate from the main price tracking workbook.

Access to the private workbook should be restricted to authorized users.

### Data Flow

```text
Playwright Price Tracker
          |
          | Product prices
          v
Google Apps Script Web App
          |
          +-------------------------+
          |                         |
          v                         v
Price Tracker Workbook       Private Workbook
          |                         |
          v                         v
Price History                Subscribers
Products                     Subscriptions
                             Alert Log
                             Alert State
                                  |
                                  v
                           Email Notifications
```

---

## Subscription and Email Alert System

The subscription and notification system is managed through Google Apps Script.

### Subscription Registration

1. A user submits an email address and selects one or more products.
2. The user chooses a suggested or custom target price.
3. The Apps Script backend validates the selected products and target prices.
4. Subscriber and subscription records are stored in the private workbook.
5. A verification email is sent to the subscriber.

### Email Verification

1. The subscriber clicks the verification link.
2. Apps Script validates the verification token.
3. The subscriber's verification status is updated.
4. Associated subscriptions are activated.
5. Only verified subscribers with active subscriptions are eligible for price alerts.

### Price Alert Processing

Whenever the Playwright tracker submits a new price:

1. Apps Script saves the price to the appropriate history sheet in the original workbook.
2. The backend checks active subscriptions for the product and currency.
3. It compares the current price against each subscriber's target price.
4. If the target is reached, an email notification is sent.
5. The successful notification is recorded in the private `Alert Log` sheet.
6. The `Alert State` sheet is updated to prevent duplicate notifications.

### Duplicate Alert Prevention

Alert state is tracked separately for each subscription and retailer.

| Scenario                             | Expected Behaviour                   |
| ------------------------------------ | ------------------------------------ |
| Price is above target                | No email is sent                     |
| Price drops to or below target       | Email notification is sent           |
| Price remains at or below target     | Further notifications are suppressed |
| Price rises above target             | Alert state resets                   |
| Price drops to or below target again | A new notification is sent           |

This allows subscribers to receive meaningful price-drop notifications without receiving repeated emails every time the tracker checks a product.

### Unsubscribe

Each price alert email contains an unsubscribe link.

When a subscriber uses the link:

1. Apps Script validates the unsubscribe token.
2. The corresponding subscription is deactivated.
3. The subscription's active status is updated in the private workbook.
4. No further alerts are sent for that subscription.

---

## Google Apps Script Configuration

The Google Apps Script backend is deployed separately from the Playwright project.

The backend handles:

- Incoming price submissions
- Product catalogue synchronization
- Subscription registration
- Subscriber email verification
- Subscription activation and deactivation
- Price alert processing
- Alert logging and duplicate prevention
- Email notifications

The integration uses the following configuration:

- `GOOGLE_SHEETS_WEB_APP_URL`
- `PRICE_TRACKER_SECRET`
- `PRIVATE_SPREADSHEET_ID` in the Apps Script project

The private spreadsheet ID must point to the separate subscriber workbook.

When making changes to Apps Script:

1. Save the updated script.
2. Open **Deploy → Manage deployments**.
3. Edit the existing Web App deployment.
4. Select **New version**.
5. Deploy the updated version.

Updating the existing deployment preserves the web app URL used by the Playwright project.

---

## GitHub Actions

The project uses GitHub Actions to run price checks automatically.

The workflow is located at:

```text
.github/workflows/price-tracker.yml
```

The workflow performs the following steps:

1. Checks out the repository.
2. Sets up Node.js.
3. Installs npm dependencies.
4. Installs Playwright browsers and required system dependencies.
5. Runs the price-tracking tests using WebKit.
6. Uploads available test results and reports as workflow artifacts.

### Scheduled Execution

The workflow is scheduled to run twice daily using the `America/Toronto` time zone.

It can also be triggered manually through the GitHub Actions tab.

### GitHub Repository Secrets

For scheduled executions, configure the following secrets:

| Secret                      | Description                         |
| --------------------------- | ----------------------------------- |
| `GOOGLE_SHEETS_WEB_APP_URL` | Google Apps Script web app endpoint |
| `PRICE_TRACKER_SECRET`      | Shared authentication secret        |

Configure these under:

**GitHub Repository → Settings → Secrets and variables → Actions**

The workflow must pass these secrets to the test-running step.

---

## Code Formatting

The project uses Prettier to maintain consistent code formatting.

### Format Files

```bash
npm run format
```

### Check Formatting Without Making Changes

```bash
npm run format:check
```

---

## Troubleshooting

### Missing Google Sheets Environment Variables

If the tracker reports that `GOOGLE_SHEETS_WEB_APP_URL` or `PRICE_TRACKER_SECRET` is missing:

- Confirm both variables exist in the local `.env` file.
- Check that the variable names match exactly.
- For GitHub Actions, confirm both secrets are configured in repository settings.
- Confirm the workflow passes the secrets into the test-running step.

### Google Sheets Data Not Updating

- Confirm the Google Apps Script web app is deployed.
- Verify that the deployment URL is correct.
- Confirm the shared secret matches the value configured in Apps Script.
- Check the Apps Script execution logs for errors.
- Confirm the required sheet names exist in the appropriate workbook.
- Verify that the private workbook ID is correctly configured in Apps Script.

### Subscription or Email Alert Issues

If a subscriber does not receive an email:

- Confirm the subscriber has completed email verification.
- Check that the subscription is active.
- Confirm the product ID and currency match the incoming price data.
- Check the subscriber's target price.
- Review the `Alert Log` and `Alert State` sheets.
- Check the Apps Script execution logs and email authorization.

### Price or Currency Validation Failures

Retailer websites may display prices in different currencies depending on localization settings.

If a test fails:

- Check the retailer page and confirm the displayed currency.
- Verify the expected currency in the product configuration.
- Confirm the test extracts the correct price and currency metadata.
- Check whether the retailer's page structure or localization controls have changed.

### Failed Playwright Tests

Run the affected suite independently:

```bash
npx playwright test tests/speaker-price.spec.ts --project=webkit
```

Replace the filename with the relevant test suite.

Review the terminal output, Playwright report, screenshots, and traces where available.

---

## Future Improvements

Potential enhancements include:

- Adding more retailers and products.
- Improving resilience to retailer page changes.
- Expanding price history reporting and visualization.
- Adding more detailed price trend analysis.
- Improving subscriber management.
- Adding additional notification preferences.
- Enhancing monitoring and error reporting.

---

## Disclaimer

This project is intended for personal price tracking and automation practice.

Retailer websites can change their layouts, pricing, availability, and localization behaviour at any time. Collected prices may not reflect final checkout prices, shipping costs, taxes, or product availability.

Price alerts depend on successful retailer checks, Google Apps Script execution, and email delivery.
