
import { test, expect } from '@playwright/test';
import productData from '../data/products.json';
import { savePriceHistory } from '../utils/price-history';
import { savePriceToGoogleSheets } from '../utils/google-sheets';

const product = productData.products.find(
  (item) => item.id === 'audio-technica-at-lp70x-bz'
);

if (!product) {
  throw new Error('Turntable not found in data/products.json');
}

const enabledRetailers = product.retailers.filter(
  (retailer) => retailer.enabled
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
        .filter((line) => /\$\s?\d|price|sale/i.test(line))
        .slice(0, 30)
    );

    const priceMetadata = await page
      .locator(
        'meta[property*="price"], meta[itemprop="price"], script[type="application/ld+json"]'
      )
      .evaluateAll((elements) =>
        elements.map((element) => ({
          tag: element.tagName,
          property: element.getAttribute('property'),
          itemprop: element.getAttribute('itemprop'),
          content: element.getAttribute('content'),
          text:
            element.tagName === 'SCRIPT'
              ? element.textContent?.slice(0, 3000)
              : undefined,
        }))
      );

    console.log('Embedded price metadata:', priceMetadata);


    // Extract the price from Open Graph metadata first.
    const metaPrice = priceMetadata.find(
      (item) => item.property === 'og:price:amount'
    )?.content;

    const metaCurrency = priceMetadata.find(
      (item) => item.property === 'og:price:currency'
    )?.content;

    let currentPrice: number | null = null;
    let priceCurrency: string | null = null;

    if (metaPrice && metaCurrency) {
      const parsedPrice = Number(metaPrice);

      if (Number.isFinite(parsedPrice) && parsedPrice >= 0) {
        currentPrice = parsedPrice;
        priceCurrency = metaCurrency;
      }
    }

    // Extract price from metadata first, then fall back to JSON-LD.
      const extractedPriceResult = await page.evaluate(() => {
        const amountMeta = document.querySelector<HTMLMetaElement>(
          'meta[property="og:price:amount"], ' +
          'meta[property="product:price:amount"], ' +
          'meta[itemprop="price"]'
        );

        const currencyMeta = document.querySelector<HTMLMetaElement>(
          'meta[property="og:price:currency"], ' +
          'meta[property="product:price:currency"], ' +
          'meta[itemprop="priceCurrency"]'
        );

        if (amountMeta?.content) {
          const price = Number(amountMeta.content);
          const currency = currencyMeta?.content ?? '';

          if (Number.isFinite(price) && currency) {
            return { price, currency };
          }
        }

        // Fallback: inspect structured product data.
        function findOffer(value: unknown): {
          price: number;
          currency: string;
        } | null {
          if (Array.isArray(value)) {
            for (const item of value) {
              const result = findOffer(item);
              if (result) return result;
            }
            return null;
          }

          if (value && typeof value === 'object') {
            const obj = value as Record<string, unknown>;

            if (obj.price != null && obj.priceCurrency) {
              const price = Number(obj.price);
              const currency = String(obj.priceCurrency);

              if (Number.isFinite(price)) {
                return { price, currency };
              }
            }

            for (const nestedValue of Object.values(obj)) {
              const result = findOffer(nestedValue);
              if (result) return result;
            }
          }

          return null;
        }

        const scripts = document.querySelectorAll(
          'script[type="application/ld+json"]'
        );

        for (const script of scripts) {
          try {
            const data: unknown = JSON.parse(
              script.textContent ?? ''
            );
            const result = findOffer(data);

            if (result) return result;
          } catch {
            // Ignore invalid JSON-LD and try the next script.
          }
        }

        return null;
      });

      const extractedPrice = extractedPriceResult?.price ?? null;
      const extractedCurrency = extractedPriceResult?.currency ?? null;

      console.log('Extracted price:', extractedPrice);
      console.log('Price currency:', extractedCurrency);

      if (extractedPrice === null || extractedCurrency !== product.currency) {
        console.log(
          'PRICE UNKNOWN: No valid price in the expected currency.'
        );
      } else if (extractedPrice <= product.targetPrice) {
        console.log(
          `TARGET MET: ${extractedCurrency} ${extractedPrice} is at or below your target.`
        );
      } else {
        console.log(
          `TARGET NOT MET: ${extractedCurrency} ${(extractedPrice - product.targetPrice).toFixed(2)} above your target.`
        );
      }

    if (
  extractedPrice !== null &&
  Number.isFinite(extractedPrice) &&
  extractedCurrency === product.currency
) {
  await savePriceHistory({
    checkedAt: new Date().toISOString(),
    productId: product.id,
    productName: product.name,
    retailer: retailer.name,
    productUrl: retailer.url,
    price: extractedPrice,
    currency: extractedCurrency,
    targetPrice: product.targetPrice,
    targetMet: extractedPrice <= product.targetPrice,
  });

  try {
  await savePriceToGoogleSheets({
    checkedAt: new Date().toISOString(),
    productId: product.id,
    productName: product.name,
    retailer: retailer.name,
    productUrl: retailer.url,
    price: extractedPrice,
    currency: extractedCurrency,
    targetPrice: product.targetPrice,
    targetMet: extractedPrice <= product.targetPrice,
  });
} catch (error) {
  console.error(
    'Google Sheets save failed; local CSV history is preserved:',
    error
  );
}

  console.log('Price saved to local history.');
} else {
  console.log('Price history skipped: no valid price found.');
}

    await page.screenshot({
      path: `test-results/${retailer.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-turntable.png`,
      fullPage: false,
    });

    expect(
      response,
      `${retailer.name} should return a response`
    ).toBeTruthy();

    expect(
      response?.status(),
      `${retailer.name} should return HTTP 200`
    ).toBe(200);

    expect(bodyText.length).toBeGreaterThan(0);
  });
}
