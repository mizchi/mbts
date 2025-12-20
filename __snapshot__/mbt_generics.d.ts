// Generated from .mbt file - DO NOT EDIT

export interface Container<T> {
  readonly value: T;
}

export function identity<T>(x: T): T;

export function map<A, B>(container: Container<A>, f: (arg0: A) => B): Container<B>;