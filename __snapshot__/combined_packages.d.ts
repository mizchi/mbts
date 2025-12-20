// Generated from .mbti files - DO NOT EDIT
// MoonBit Parser TypeScript Definitions

declare namespace basic {
  export interface Position {
    readonly fname: string;
    readonly lnum: number;
    readonly bol: number;
    readonly cnum: number;
  }

  export interface Location {
    readonly start: Position;
    readonly end: Position;
  }

}

declare namespace tokens {
  export interface Comment {
    readonly content: string;
    readonly kind: CommentKind;
    consumed_by_docstring: boolean;
  }

  export interface CommentKind_InlineTrailing { readonly $tag: "InlineTrailing"; }
  export interface CommentKind_Ownline { readonly $tag: "Ownline"; readonly leading_blank_line: boolean; readonly trailing_blank_line: boolean; }
  export type CommentKind = CommentKind_InlineTrailing | CommentKind_Ownline;
  
  export const CommentKind$InlineTrailing: CommentKind_InlineTrailing;
  export function CommentKind$Ownline(leading_blank_line: boolean, trailing_blank_line: boolean): CommentKind_Ownline;
  

  export interface Token_CHAR { readonly $tag: "CHAR"; readonly $0: string; }
  export interface Token_INT { readonly $tag: "INT"; readonly $0: string; }
  export interface Token_STRING { readonly $tag: "STRING"; readonly $0: string; }
  export interface Token_LIDENT { readonly $tag: "LIDENT"; readonly $0: string; }
  export interface Token_UIDENT { readonly $tag: "UIDENT"; readonly $0: string; }
  export interface Token_COMMENT { readonly $tag: "COMMENT"; readonly $0: Comment; }
  export interface Token_NEWLINE { readonly $tag: "NEWLINE"; }
  export interface Token_EOF { readonly $tag: "EOF"; }
  export type Token = Token_CHAR | Token_INT | Token_STRING | Token_LIDENT | Token_UIDENT | Token_COMMENT | Token_NEWLINE | Token_EOF;
  
  export function Token$CHAR($0: string): Token_CHAR;
  export function Token$INT($0: string): Token_INT;
  export function Token$STRING($0: string): Token_STRING;
  export function Token$LIDENT($0: string): Token_LIDENT;
  export function Token$UIDENT($0: string): Token_UIDENT;
  export function Token$COMMENT($0: Comment): Token_COMMENT;
  export const Token$NEWLINE: Token_NEWLINE;
  export const Token$EOF: Token_EOF;
  

}