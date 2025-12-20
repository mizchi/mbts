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

// Method: Any::_get

// Method: Any::_set

// Method: Any::cast

export interface Promise<T> {
  readonly __brand: "Promise";
}

// Method: Promise::wait

// Method: Promise::resolve

// Method: Promise::reject

export interface PromiseResolvers<T> {
  readonly promise: Promise<T>;
  readonly resolve: (arg0: T) => void;
  readonly reject: (arg0: Error) => void;
}