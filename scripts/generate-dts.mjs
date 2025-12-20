#!/usr/bin/env node
// Generate .d.ts from .mbti file
// Usage: node scripts/generate-dts.mjs <mbti-file> [--namespace]

import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

// Import the generated MoonBit module
import {
  generate_dts_from_string,
  generate_dts_namespace_from_string,
  generate_dts_with_preamble_from_string,
} from '../target/js/release/build/cli/cli.js';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
mbts - MoonBit to TypeScript type generator

Usage:
  node scripts/generate-dts.mjs <mbti-file> [options]

Options:
  --namespace    Wrap output in TypeScript namespace
  --preamble     Include runtime type definitions (Ref<T>, etc.)
  --output, -o   Output file path (default: stdout)
  --help, -h     Show this help

Example:
  node scripts/generate-dts.mjs lib/pkg.mbti
  node scripts/generate-dts.mjs lib/pkg.mbti --namespace -o lib.d.ts
`);
  process.exit(0);
}

const inputFile = args.find(arg => !arg.startsWith('-'));
const useNamespace = args.includes('--namespace');
const usePreamble = args.includes('--preamble');
const outputIndex = args.findIndex(arg => arg === '--output' || arg === '-o');
const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : null;

if (!inputFile) {
  console.error('Error: No input file specified');
  process.exit(1);
}

try {
  const content = readFileSync(inputFile, 'utf-8');
  const filename = basename(inputFile);

  let result;
  if (useNamespace) {
    result = generate_dts_namespace_from_string(content, filename);
  } else if (usePreamble) {
    result = generate_dts_with_preamble_from_string(content, filename);
  } else {
    result = generate_dts_from_string(content, filename);
  }

  if (outputFile) {
    writeFileSync(outputFile, result);
    console.log(`Generated: ${outputFile}`);
  } else {
    console.log(result);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
