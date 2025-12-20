// Generated from .mbti file - DO NOT EDIT

export interface MyResult_Ok { readonly $tag: "Ok"; readonly $0: string; }
export interface MyResult_Err { readonly $tag: "Err"; readonly $0: string; }
export type MyResult = MyResult_Ok | MyResult_Err;

export function MyResult$Ok($0: string): MyResult_Ok;
export function MyResult$Err($0: string): MyResult_Err;