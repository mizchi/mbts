// Generated from .mbti file - DO NOT EDIT

export function jsglue_identity(arg0: any /* TODO: @core.Any */): any /* TODO: @core.Any */;

export function add(arg0: number, arg1: number): number;

export function box_get(arg0: Box<any /* TODO: @core.Any */>): any /* TODO: @core.Any */;

export function box_new(arg0: any /* TODO: @core.Any */): Box<any /* TODO: @core.Any */>;

export function box_set(arg0: Box<any /* TODO: @core.Any */>, arg1: any /* TODO: @core.Any */): void;

export function create_point(arg0: number, arg1: number): Point;

export function create_user(arg0: number, arg1: string): User;

export function distance(arg0: Point, arg1: Point): number;

export function greet(arg0: string): string;

export function identity<T>(arg0: T): T;

export function identity_any(arg0: any /* TODO: @core.Any */): any /* TODO: @core.Any */;

export interface Box<T> {
  readonly __brand: "Box";
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Result_Ok<T, E> { readonly $tag: "Ok"; readonly $0: T; }
export interface Result_Err<T, E> { readonly $tag: "Err"; readonly $0: E; }
export type Result<T, E> = Result_Ok<T, E> | Result_Err<T, E>;

export function result$ok($0: T): Result_Ok;
export function result$err($0: E): Result_Err;


export interface Status_Pending { readonly $tag: "Pending"; }
export interface Status_Active { readonly $tag: "Active"; }
export interface Status_Done { readonly $tag: "Done"; }
export type Status = Status_Pending | Status_Active | Status_Done;

export const Status$Pending: Status_Pending;
export const Status$Active: Status_Active;
export const Status$Done: Status_Done;


export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string | undefined;
}