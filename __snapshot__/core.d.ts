// Generated from .mbti file - DO NOT EDIT

export function any_<T>(arg0: T): Any;

export function globalThis(): Any;

export function isNull(arg0: Any): boolean;

export function isUndefined(arg0: Any): boolean;

export function jsonParse(arg0: string): Any;

export function jsonStringify(arg0: Any): string;

export function null_(): Any;

export function undefined_(): Any;

export function sleep(arg0: number): void;

export interface Any {
  readonly __brand: "Any";
}

export function Any$Get(arg0: Any, arg1: string): Any;

export function Any$Set(arg0: Any, arg1: string, arg2: Any): void;

export function Any$cast<T>(arg0: Any): T;

// Using TypeScript built-in: Promise

export function Promise$wait<T>(arg0: Promise<T>): T;

export function Promise$resolve<A>(arg0: A): Promise<A>;

export function Promise$reject(arg0: Any): Promise<Any>;

export interface PromiseResolvers<T> {
  readonly promise: Promise<T>;
  readonly resolve: (arg0: T) => void;
  readonly reject: (arg0: Error) => void;
}