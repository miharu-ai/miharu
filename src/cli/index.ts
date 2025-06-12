#!/usr/bin/env node

import { dashboardCommand } from './commands/dashboard';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'dashboard':
      await dashboardCommand();
      break;
    default:
      console.log('Usage: npx miharu-ai dashboard');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});