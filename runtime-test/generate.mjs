import { dtsToMbt } from '../js/dts-to-mbt.ts';
import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('./runtime-test/helpers.d.ts', 'utf-8');
const mbt = dtsToMbt(content, 'helpers.d.ts');
console.log(mbt);
writeFileSync('./runtime-test/src/ffi.mbt', mbt);
console.log('\n--- Saved to runtime-test/src/ffi.mbt ---');
