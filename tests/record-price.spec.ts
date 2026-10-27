
import { test, expect } from '@playwright/test';
import recordsData from '../data/records.json';
import { savePriceHistory } from '../utils/price-history';
import { savePriceToGoogleSheets } from '../utils/google-sheets';

test.describe('Record Price Tracker', () => {
  for (const product of recordsData.products) {
    for (const retailer of product.retailers.filter((item) => item.enabled)) {
      test(`${product.name} - ${retailer.name}`, async ({ page }) => {
        console.log(`\nProduct: ${product.name}`);
        console.log(`Retailer: ${retailer.name}`);
        console.log(`Target price: ${product.currency} $${product.targetPrice}`);
        console.log(`URL: ${retailer.url}`);

        const response = await page.goto(retailer.url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });

        console.log('HTTP status:', response?.status());

        await page.waitForTimeout(2000);

        const pageTitle = await page.title();
        console.log('Page title:', pageTitle);

        const priceData = await page.evaluate(() => {
          const metaPrice =
            document
              .querySelector('meta[property="product:price:amount"]')
              ?.getAttribute('content') ??
            document
              .querySelector('meta[property="og:price:amount"]')
              ?.getAttribute('content');

          const metaCurrency =
            document
              .querySelector('meta[property="product:price:currency"]')
              ?.getAttribute('content') ??
            document
              .querySelector('meta[property="og:price:currency"]')
              ?.getAttribute('content');

          const jsonLdScripts = Array.from(
            document.querySelectorAll('script[type="application/ld+json"]')
          );

          let structuredPrice: string | number | undefined;
          let structuredCurrency: string | undefined;

          for (const script of jsonLdScripts) {
            try {
              const data = JSON.parse(script.textContent ?? '');
              const items = Array.isArray(data) ? data : [data];

              for (const item of items) {
                const offers = Array.isArray(item.offers)
                  ? item.offers
                  : item.offers
                    ? [item.offers]
                    : [];

                for (const offer of offers) {
                  if (offer.price !== undefined) {
                    structuredPrice = offer.price;
                    structuredCurrency = offer.priceCurrency;
                    break;
                  }
                }

                if (structuredPrice !== undefined) {
                  break;
                }
              }

              if (structuredPrice !== undefined) {
                break;
              }
            } catch {
              // Ignore invalid JSON-LD blocks and check the next one.
            }
          }

          return {
            price: metaPrice ?? structuredPrice,
            currency: metaCurrency ?? structuredCurrency,
            visibleText: document.body.innerText.slice(0, 1500),
          };
        });

        console.log('Price metadata:', priceData.price);
        console.log('Currency metadata:', priceData.currency);
        console.log('Page text preview:', priceData.visibleText);

        if (response?.status() !== 200) {
          throw new Error(
            `Retailer page returned HTTP ${response?.status() ?? 'no response'}`
          );
        }

        expect(pageTitle).not.toBe('');

        expect(
          priceData.price,
          `No structured price found for ${product.name} at ${retailer.name}`
        ).not.toBeNull();

        expect(
          priceData.price,
          `No structured price found for ${product.name} at ${retailer.name}`
        ).not.toBeUndefined();

        const price = Number(priceData.price);

        expect(
          Number.isFinite(price) && price > 0,
          `Invalid price extracted for ${product.name}: ${priceData.price}`
        ).toBe(true);

        const currency = String(priceData.currency ?? '').toUpperCase();

        expect(
          currency,
          `Unexpected currency for ${product.name}: expected ${product.currency}, received ${currency || 'unknown'}`
        ).toBe(product.currency);

        const targetMet = price <= product.targetPrice;

        console.log(`Current price: ${currency} $${price.toFixed(2)}`);
        console.log(
          targetMet
            ? 'TARGET MET!'
            : `Target not met. Difference: $${(
                price - product.targetPrice
              ).toFixed(2)}`
        );

        const entry = {
          checkedAt: new Date().toISOString(),
          productId: product.id,
          productName: product.name,
          retailer: retailer.name,
          productUrl: retailer.url,
          price,
          currency,
          targetPrice: product.targetPrice,
          targetMet,
        };

        await savePriceHistory(entry);

        await savePriceToGoogleSheets(entry, 'record');

        await page.screenshot({
          path: `test-results/${product.id}-${retailer.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}.png`,
          fullPage: true,
        });
      });
    }
  }
});
