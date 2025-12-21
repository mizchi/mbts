// Generated from .mbti file - DO NOT EDIT

export interface ApiClient {
  readonly __brand: "ApiClient";
}

export interface ApiResponse {
  readonly data: string;
  readonly status: number;
}

export interface Color_Red { readonly $tag: "Red"; }
export interface Color_Green { readonly $tag: "Green"; }
export interface Color_Blue { readonly $tag: "Blue"; }
export type Color = Color_Red | Color_Green | Color_Blue;

export const Color$Red: Color_Red;
export const Color$Green: Color_Green;
export const Color$Blue: Color_Blue;


export interface Container<T> {
  readonly __brand: "Container";
}

export interface Counter {
  readonly __brand: "Counter";
}

export interface Result<T, E> {
  readonly value: T | undefined;
  readonly error: E | undefined;
}

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