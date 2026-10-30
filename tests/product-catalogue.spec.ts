import { test, expect } from '@playwright/test';
import { getProductCatalogue } from '../utils/product-catalogue';

test('should load the complete product catalogue', () => {
  const products = getProductCatalogue();

  console.log('Total products:', products.length);

  console.log(
    'Products by category:',
    products.reduce(
      (counts, product) => {
        counts[product.category]++;
        return counts;
      },
      {
        turntable: 0,
        speaker: 0,
        record: 0,
      },
    ),
  );

  expect(products.length).toBeGreaterThan(0);
  expect(products.some((product) => product.category === 'turntable')).toBe(
    true,
  );
  expect(products.some((product) => product.category === 'speaker')).toBe(true);
  expect(products.some((product) => product.category === 'record')).toBe(true);
});
