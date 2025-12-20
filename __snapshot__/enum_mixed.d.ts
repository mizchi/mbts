// Generated from .mbti file - DO NOT EDIT

export interface LoadState_Idle { readonly $tag: "Idle"; }
export interface LoadState_Loading { readonly $tag: "Loading"; }
export interface LoadState_Success { readonly $tag: "Success"; readonly $0: string; }
export interface LoadState_Error { readonly $tag: "Error"; readonly $0: string; }
export type LoadState = LoadState_Idle | LoadState_Loading | LoadState_Success | LoadState_Error;

export const LoadState$Idle: LoadState_Idle = { $tag: "Idle" };
export const LoadState$Loading: LoadState_Loading = { $tag: "Loading" };
export function LoadState$Success($0: string): LoadState_Success { return { $tag: "Success", $0 }; }
export function LoadState$Error($0: string): LoadState_Error { return { $tag: "Error", $0 }; }