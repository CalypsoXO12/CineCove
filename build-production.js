#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Building CineCove for production...');

try {
  // Build frontend
  console.log('📦 Building frontend with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Compile TypeScript server to JavaScript  
  console.log('⚙️ Compiling server...');
  execSync('npx tsx build server/production.ts', { stdio: 'inherit' });
  
  console.log('📋 Preparing production files...');
  // Just ensure the production.ts file is ready to run with tsx
  
  console.log('✅ Production build complete!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}