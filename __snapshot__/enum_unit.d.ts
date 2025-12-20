// Generated from .mbti file - DO NOT EDIT

export interface Status_Pending { readonly $tag: "Pending"; }
export interface Status_Active { readonly $tag: "Active"; }
export interface Status_Done { readonly $tag: "Done"; }
export type Status = Status_Pending | Status_Active | Status_Done;

export const Status$Pending: Status_Pending = { $tag: "Pending" };
export const Status$Active: Status_Active = { $tag: "Active" };
export const Status$Done: Status_Done = { $tag: "Done" };