import 'dotenv/config';
import { getProductCatalogue } from './product-catalogue';

export interface GoogleSheetPriceEntry {
  checkedAt: string;
  productId: string;
  productName: string;
  retailer: string;
  productUrl: string;
  price: number;
  currency: string;
  targetPrice: number;
  targetMet: boolean;
}

export type ProductCategory = 'turntable' | 'speaker' | 'record';

const SHEET_NAMES: Record<ProductCategory, string> = {
  turntable: 'Turntable Price History',
  speaker: 'Speaker Price History',
  record: 'Record Price History',
};

function getGoogleSheetsConfig(): { url: string; secret: string } {
  const url = process.env.GOOGLE_SHEETS_WEB_APP_URL;
  const secret = process.env.PRICE_TRACKER_SECRET;

  if (!url) {
    throw new Error('GOOGLE_SHEETS_WEB_APP_URL is missing from .env');
  }

  if (!secret) {
    throw new Error('PRICE_TRACKER_SECRET is missing from .env');
  }

  return { url, secret };
}

export async function savePriceToGoogleSheets(
  entry: GoogleSheetPriceEntry,
  category: ProductCategory = 'turntable',
): Promise<void> {
  const { url, secret } = getGoogleSheetsConfig();
  const sheetName = SHEET_NAMES[category];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      ...entry,
      sheetName,
      secret,
    }),
    redirect: 'follow',
  });

  const responseText = await response.text();

  console.log('Google Sheets HTTP status:', response.status);
  console.log('Google Sheets response URL:', response.url);
  console.log('Google Sheets response preview:', responseText.slice(0, 300));

  let result: { success?: boolean; message?: string };

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Google Sheets returned non-JSON content. HTTP ${response.status}. ` +
        `Response preview: ${responseText.slice(0, 200)}`,
    );
  }

  if (!response.ok || result.success !== true) {
    throw new Error(
      `Google Sheets save failed: ${result.message ?? response.statusText}`,
    );
  }

  console.log(`Price saved to Google Sheets tab: ${sheetName}`);
}

export async function syncProductsToGoogleSheets(): Promise<void> {
  const { url, secret } = getGoogleSheetsConfig();
  const products = getProductCatalogue();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      action: 'syncProducts',
      products,
      secret,
    }),
    redirect: 'follow',
  });

  const responseText = await response.text();

  let result: { success?: boolean; message?: string };

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Google Sheets returned non-JSON content. HTTP ${response.status}. ` +
        `Response preview: ${responseText.slice(0, 200)}`,
    );
  }

  if (!response.ok || result.success !== true) {
    throw new Error(
      `Product catalogue sync failed: ${result.message ?? response.statusText}`,
    );
  }

  console.log(
    `Successfully synced ${products.length} products to Google Sheets.`,
  );
}
