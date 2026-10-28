import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export interface PriceHistoryEntry {
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

const historyDirectory = path.join(process.cwd(), 'data');
const historyFile = path.join(historyDirectory, 'price-history.csv');

function csvValue(value: string | number | boolean): string {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function savePriceHistory(
  entry: PriceHistoryEntry,
): Promise<void> {
  await mkdir(historyDirectory, { recursive: true });

  let needsHeader = false;

  try {
    const { stat } = await import('node:fs/promises');
    const fileInfo = await stat(historyFile);
    needsHeader = fileInfo.size === 0;
  } catch {
    needsHeader = true;
  }

  const headers = [
    'checkedAt',
    'productId',
    'productName',
    'retailer',
    'productUrl',
    'price',
    'currency',
    'targetPrice',
    'targetMet',
  ];

  const values = [
    entry.checkedAt,
    entry.productId,
    entry.productName,
    entry.retailer,
    entry.productUrl,
    entry.price,
    entry.currency,
    entry.targetPrice,
    entry.targetMet,
  ];

  const lines = [
    ...(needsHeader ? [headers.map(csvValue).join(',')] : []),
    values.map(csvValue).join(','),
  ];

  await appendFile(historyFile, lines.join('\n') + '\n', 'utf8');
}
