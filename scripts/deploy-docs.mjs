import { cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const distDir = resolve(projectRoot, 'dist');
const docsDir = resolve(projectRoot, 'docs');

if (!existsSync(distDir)) {
  console.error('Missing dist/ folder. Run "npm run build" before deploying.');
  process.exit(1);
}

await rm(docsDir, { recursive: true, force: true });
await cp(distDir, docsDir, { recursive: true });

console.log('Synced dist/ to docs/.');
