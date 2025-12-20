// Type definitions for helpers.js

export function add(a: number, b: number): number;
export function greet(name: string): string;
export function getLength(arr: number[]): number;

export interface Person {
  name: string;
  age: number;
}

export function createPerson(name: string, age: number): Person;
export function getPersonName(person: Person): string;

export function fetchData(url: string): Promise<string>;

export class Counter {
  constructor(initial: number);
  increment(): number;
  getValue(): number;
}
