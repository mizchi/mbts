// Generated from .mbti file - DO NOT EDIT

export interface ParseError_UnexpectedToken extends Error { readonly $tag: "UnexpectedToken"; readonly $0: string; }
export interface ParseError_UnexpectedEndOfInput extends Error { readonly $tag: "UnexpectedEndOfInput"; }
export interface ParseError_InvalidSyntax extends Error { readonly $tag: "InvalidSyntax"; readonly line: number; readonly message: string; }
export type ParseError = ParseError_UnexpectedToken | ParseError_UnexpectedEndOfInput | ParseError_InvalidSyntax;

export function ParseError$UnexpectedToken($0: string): ParseError_UnexpectedToken;
export const ParseError$UnexpectedEndOfInput: ParseError_UnexpectedEndOfInput;
export function ParseError$InvalidSyntax(line: number, message: string): ParseError_InvalidSyntax;