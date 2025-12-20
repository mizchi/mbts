// Generated from .mbt file - DO NOT EDIT

export interface Counter {
  readonly value: number;
}

export function Counter$new(): Counter;

export function Counter$increment(self: Counter): Counter;

export function Counter$get(self: Counter): number;