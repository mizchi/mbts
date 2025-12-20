// Simple JS helper functions for FFI testing
// These will be called from MoonBit via extern "js"

export function add(a, b) {
  return a + b;
}

export function greet(name) {
  return `Hello, ${name}!`;
}

export function getLength(arr) {
  return arr.length;
}

export function createPerson(name, age) {
  return { name, age };
}

export function getPersonName(person) {
  return person.name;
}

// Async function
export async function fetchData(url) {
  return `Fetched: ${url}`;
}

// Class
export class Counter {
  constructor(initial) {
    this.value = initial;
  }

  increment() {
    this.value++;
    return this.value;
  }

  getValue() {
    return this.value;
  }
}
