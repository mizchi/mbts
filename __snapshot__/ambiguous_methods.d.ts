// Generated from .mbti file - DO NOT EDIT

export interface Position {
  readonly line: number;
  readonly column: number;
}

export function Position$new(arg0: number, arg1: number): Position;

export function Position$offset(arg0: Position): number;

export function Position$compare(arg0: Position, arg1: Position): number;