// Generated from .mbti file - DO NOT EDIT

export function getCloseCode(arg0: core.Any): number;

export interface WebSocket {
  readonly url: string;
  readonly readyState: number;
  binaryType: string;
}

// Method: WebSocket::new

// Method: WebSocket::close

// Method: WebSocket::send_string

export interface WebSocketReadyState_Connecting { readonly $tag: "Connecting"; }
export interface WebSocketReadyState_Open { readonly $tag: "Open"; }
export interface WebSocketReadyState_Closing { readonly $tag: "Closing"; }
export interface WebSocketReadyState_Closed { readonly $tag: "Closed"; }
export type WebSocketReadyState = WebSocketReadyState_Connecting | WebSocketReadyState_Open | WebSocketReadyState_Closing | WebSocketReadyState_Closed;

export const WebSocketReadyState$Connecting: WebSocketReadyState_Connecting = { $tag: "Connecting" };
export const WebSocketReadyState$Open: WebSocketReadyState_Open = { $tag: "Open" };
export const WebSocketReadyState$Closing: WebSocketReadyState_Closing = { $tag: "Closing" };
export const WebSocketReadyState$Closed: WebSocketReadyState_Closed = { $tag: "Closed" };


// Method: WebSocketReadyState::to_int