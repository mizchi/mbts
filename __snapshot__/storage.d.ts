// Generated from .mbti file - DO NOT EDIT

export function localStorage(): Storage;

export function sessionStorage(): Storage;

export interface Storage {
  readonly length: number;
}

export function Storage$asAny(arg0: Storage): core.Any;

export function Storage$clear(arg0: Storage): void;

export function Storage$entries(arg0: Storage): Array<[string, string]>;

export function Storage$getItem(arg0: Storage, arg1: string): string | undefined;

export function Storage$hasItem(arg0: Storage, arg1: string): boolean;

export function Storage$key(arg0: Storage, arg1: number): string | undefined;

export function Storage$keys(arg0: Storage): Array<string>;

export function Storage$removeItem(arg0: Storage, arg1: string): void;

export function Storage$setItem(arg0: Storage, arg1: string, arg2: string): void;

export function Storage$values(arg0: Storage): Array<string>;