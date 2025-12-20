// Generated from .mbti file - DO NOT EDIT

export function getCloseCode(arg0: any /* TODO: @core.Any */): number;

export interface WebSocket {
  readonly url: string;
  readonly readyState: number;
  binaryType: string;
}

export function WebSocket$new(arg0: string, protocols?: Array<string>): WebSocket;

export function WebSocket$close(arg0: WebSocket, code?: number, reason?: string): void;

export function WebSocket$sendString(arg0: WebSocket, arg1: string): void;

export interface WebSocketReadyState_Connecting { readonly $tag: "Connecting"; }
export interface WebSocketReadyState_Open { readonly $tag: "Open"; }
export interface WebSocketReadyState_Closing { readonly $tag: "Closing"; }
export interface WebSocketReadyState_Closed { readonly $tag: "Closed"; }
export type WebSocketReadyState = WebSocketReadyState_Connecting | WebSocketReadyState_Open | WebSocketReadyState_Closing | WebSocketReadyState_Closed;

export const WebSocketReadyState$Connecting: WebSocketReadyState_Connecting;
export const WebSocketReadyState$Open: WebSocketReadyState_Open;
export const WebSocketReadyState$Closing: WebSocketReadyState_Closing;
export const WebSocketReadyState$Closed: WebSocketReadyState_Closed;


export function WebSocketReadyState$toInt(arg0: WebSocketReadyState): number;