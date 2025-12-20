// Generated from .mbti file - DO NOT EDIT

export interface ParseArgsOption_Boolean { readonly $tag: "Boolean"; readonly key: string; readonly short: string; }
export interface ParseArgsOption_String { readonly $tag: "String"; readonly key: string; readonly short: string; readonly multiple: boolean; readonly default_: string | undefined; }
export type ParseArgsOption = ParseArgsOption_Boolean | ParseArgsOption_String;

export function ParseArgsOption$Boolean(key: string, short: string): ParseArgsOption_Boolean;
export function ParseArgsOption$String(key: string, short: string, multiple: boolean, default_: string | undefined): ParseArgsOption_String;


export interface Action_Click { readonly $tag: "Click"; readonly x: number; readonly y: number; }
export interface Action_Scroll { readonly $tag: "Scroll"; readonly delta: number; readonly direction: string; }
export interface Action_KeyPress { readonly $tag: "KeyPress"; readonly key: string; readonly modifiers: Array<string>; }
export type Action = Action_Click | Action_Scroll | Action_KeyPress;

export function Action$Click(x: number, y: number): Action_Click;
export function Action$Scroll(delta: number, direction: string): Action_Scroll;
export function Action$KeyPress(key: string, modifiers: Array<string>): Action_KeyPress;