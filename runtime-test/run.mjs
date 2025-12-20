// Runner script to test FFI runtime
// Import helpers and expose as globals, then import generated MoonBit code

import * as helpers from './helpers.js';

// Expose helpers as global variables (MoonBit extern "js" expects global access)
globalThis.add = helpers.add;
globalThis.greet = helpers.greet;
globalThis.getLength = helpers.getLength;
globalThis.createPerson = helpers.createPerson;
globalThis.getPersonName = helpers.getPersonName;
globalThis.fetchData = helpers.fetchData;

// For classes, we need to:
// 1. Create a factory function that works without 'new'
// 2. Attach prototype methods that accept 'self' as first argument

// Create Counter as a factory function
function CounterFactory(initial) {
  return new helpers.Counter(initial);
}

// Copy prototype from original class
CounterFactory.prototype = Object.create(helpers.Counter.prototype);

// Wrap prototype methods to accept self as first argument
// MoonBit FFI calls: Counter.prototype.increment(counter)
const origIncrement = helpers.Counter.prototype.increment;
const origGetValue = helpers.Counter.prototype.getValue;

CounterFactory.prototype.increment = function(self) {
  return origIncrement.call(self);
};

CounterFactory.prototype.getValue = function(self) {
  return origGetValue.call(self);
};

globalThis.Counter = CounterFactory;

// Now import and run the generated MoonBit code
const mbt = await import('./target/js/release/build/src/src.js');

// Test Promise (async function)
console.log("\n--- Testing Promise ---");
try {
  const result = await mbt.test_promise();
  console.log(`test_promise() = ${result}`);
  console.log("Promise test passed!");
} catch (e) {
  console.error("Promise test failed:", e);
}
