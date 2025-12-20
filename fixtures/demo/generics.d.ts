// ジェネリクス
export interface Result<T, E> {
  value?: T;
  error?: E;
}

export class Container<T> {
  constructor(value: T);
  get(): T;
  set(value: T): void;
}

export function wrap<T>(value: T): Container<T>;
