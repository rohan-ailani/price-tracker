import productData from '../data/products.json';
import recordData from '../data/records.json';

export interface CatalogueProduct {
  id: string;
  name: string;
  category: 'turntable' | 'speaker' | 'record';
  targetPrice: number;
  currency: string;
  active: boolean;
}

const PRODUCT_CATEGORIES: Record<string, 'turntable' | 'speaker'> = {
  'audio-technica-at-lp70x-bz': 'turntable',
  'sonos-era-100-black': 'speaker',
};

export function getProductCatalogue(): CatalogueProduct[] {
  const products: CatalogueProduct[] = [
    ...productData.products.map((product) => {
      const category = PRODUCT_CATEGORIES[product.id];

      if (!category) {
        throw new Error(`Unknown product category for: ${product.id}`);
      }

      return {
        id: product.id,
        name: product.name,
        category,
        targetPrice: product.targetPrice,
        currency: product.currency,
        active: product.retailers.some((retailer) => retailer.enabled),
      };
    }),

    ...recordData.products.map((product) => ({
      id: product.id,
      name: product.name,
      category: 'record' as const,
      targetPrice: product.targetPrice,
      currency: product.currency,
      active: product.retailers.some((retailer) => retailer.enabled),
    })),
  ];

  return products;
}
