// Generated from .mbt file - DO NOT EDIT

export interface Config {
  readonly debug: boolean;
  readonly timeout: number;
}

export function createConfig(debug: boolean, timeout: number): Config;

export interface LogLevel_Debug { readonly $tag: "Debug"; }
export interface LogLevel_Info { readonly $tag: "Info"; }
export interface LogLevel_Warn { readonly $tag: "Warn"; }
export interface LogLevel_Error { readonly $tag: "Error"; }
export type LogLevel = LogLevel_Debug | LogLevel_Info | LogLevel_Warn | LogLevel_Error;

export const LogLevel$Debug: LogLevel_Debug;
export const LogLevel$Info: LogLevel_Info;
export const LogLevel$Warn: LogLevel_Warn;
export const LogLevel$Error: LogLevel_Error;