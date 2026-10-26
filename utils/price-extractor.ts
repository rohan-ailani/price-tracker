
import type { Page } from '@playwright/test';

export interface ExtractedPrice {
  price: number;
  currency: string;
}

export async function extractPrice(page: Page): Promise<ExtractedPrice | null> {
  return page.evaluate(() => {
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

      if (Number.isFinite(price) && price >= 0 && currency) {
        return { price, currency };
      }
    }

    function findOffer(value: unknown): ExtractedPrice | null {
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

          if (Number.isFinite(price) && price >= 0 && currency) {
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
        const data: unknown = JSON.parse(script.textContent ?? '');
        const result = findOffer(data);

        if (result) return result;
      } catch {
        // Ignore invalid JSON-LD and try the next script.
      }
    }

    return null;
  });
}
