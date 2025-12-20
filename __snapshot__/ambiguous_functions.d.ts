// Generated from .mbti file - DO NOT EDIT

export function createInstance(): Instance;

export function parseWithOptions(arg0: string, arg1: Options): Result;

export function identity<T>(arg0: T): T;

export function mapResult<A, B>(arg0: Result<A, Error>, arg1: (arg0: A) => B): Result<B, Error>;

export interface Instance {
  readonly __brand: "Instance";
}

export interface Options {
  readonly __brand: "Options";
}

export interface Result<T, E> {
  readonly __brand: "Result";
}

// Using TypeScript built-in: Error