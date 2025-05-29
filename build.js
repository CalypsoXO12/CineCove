import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building frontend...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('Copying server files...');
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy server files
execSync('cp -r server dist/', { stdio: 'inherit' });
execSync('cp -r shared dist/', { stdio: 'inherit' });

console.log('Build complete!');