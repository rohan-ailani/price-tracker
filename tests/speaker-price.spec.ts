import { test, expect } from '@playwright/test';
import productData from '../data/products.json';
import { savePriceHistory } from '../utils/price-history';
import { savePriceToGoogleSheets } from '../utils/google-sheets';
import { extractPrice } from '../utils/price-extractor';

const product = productData.products.find(
  (item) => item.id === 'sonos-era-100-black',
);

if (!product) {
  throw new Error('Sonos Era 100 not found in data/products.json');
}

const enabledRetailers = product.retailers.filter(
  (retailer) => retailer.enabled,
);

if (enabledRetailers.length === 0) {
  throw new Error('No enabled retailers found for this product');
}

for (const retailer of enabledRetailers) {
  test(`inspect ${product.name} at ${retailer.name}`, async ({ page }) => {
    const response = await page.goto(retailer.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    console.log('\n--------------------------------');
    console.log('Product:', product.name);
    console.log('Retailer:', retailer.name);
    console.log('Target price:', `${product.currency} ${product.targetPrice}`);
    console.log('HTTP status:', response?.status());
    console.log('Page title:', await page.title());

    const bodyText = await page.locator('body').innerText();

    console.log(
      'Price-related text:',
      bodyText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /\$?\s?\d|price|sale/i.test(line))
        .slice(0, 30),
    );

    const extractedPrice = await extractPrice(page);

    console.log('Extracted price:', extractedPrice?.price ?? null);
    console.log('Price currency:', extractedPrice?.currency ?? null);

    if (
      extractedPrice === null ||
      extractedPrice.currency !== product.currency
    ) {
      console.log('PRICE UNKNOWN: No valid price in the expected currency.');
    } else if (extractedPrice.price <= product.targetPrice) {
      console.log(
        `TARGET MET: ${extractedPrice.currency} ${extractedPrice.price} is at or below your target.`,
      );
    } else {
      console.log(
        `TARGET NOT MET: ${extractedPrice.currency} ${(extractedPrice.price - product.targetPrice).toFixed(2)} above your target.`,
      );
    }

    if (
      extractedPrice !== null &&
      Number.isFinite(extractedPrice.price) &&
      extractedPrice.currency === product.currency
    ) {
      const historyEntry = {
        checkedAt: new Date().toISOString(),
        productId: product.id,
        productName: product.name,
        retailer: retailer.name,
        productUrl: retailer.url,
        price: extractedPrice.price,
        currency: extractedPrice.currency,
        targetPrice: product.targetPrice,
        targetMet: extractedPrice.price <= product.targetPrice,
      };

      await savePriceHistory(historyEntry);

      try {
        await savePriceToGoogleSheets(historyEntry, 'speaker');
      } catch (error) {
        console.error(
          'Google Sheets save failed; local CSV history is preserved:',
          error,
        );
      }

      console.log('Price saved to local history.');
    } else {
      console.log('Price history skipped: no valid price found.');
    }

    await page.screenshot({
      path: `test-results/${retailer.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-speaker.png`,
      fullPage: false,
    });

    expect(response, `${retailer.name} should return a response`).toBeTruthy();

    expect(response?.status(), `${retailer.name} should return HTTP 200`).toBe(
      200,
    );

    expect(bodyText.length).toBeGreaterThan(0);
  });
}
