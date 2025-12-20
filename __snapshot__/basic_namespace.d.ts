declare namespace basic {
  export interface LocStyle_Hidden { readonly $tag: "Hidden"; }
  export interface LocStyle_Json { readonly $tag: "Json"; }
  export interface LocStyle_String { readonly $tag: "String"; }
  export type LocStyle = LocStyle_Hidden | LocStyle_Json | LocStyle_String;
  
  export const LocStyle$Hidden: LocStyle_Hidden;
  export const LocStyle$Json: LocStyle_Json;
  export const LocStyle$String: LocStyle_String;
  

  export interface Location {
    readonly start: Position;
    readonly end: Position;
  }

  export function Location$merge(arg0: Location, arg1: Location): Location;

  export interface Position {
    readonly fname: string;
    readonly lnum: number;
    readonly bol: number;
    readonly cnum: number;
  }

  export function Position$column(arg0: Position): number;

}
