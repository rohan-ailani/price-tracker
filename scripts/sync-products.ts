import { syncProductsToGoogleSheets } from '../utils/google-sheets';

async function main() {
  try {
    await syncProductsToGoogleSheets();
  } catch (error) {
    console.error('Product catalogue sync failed:', error);
    process.exitCode = 1;
  }
}

main();
