// Generated from .mbti file - DO NOT EDIT

export interface AliasSig_TypeAlias { readonly $tag: "TypeAlias"; readonly name: Name; readonly type_params: list.List<TypeParamNoConstraints>; readonly type_: syntax.Type; readonly vis: syntax.Visibility; }
export interface AliasSig_TraitAlias { readonly $tag: "TraitAlias"; readonly name: Name; readonly trait_name: QualifiedName; readonly vis: syntax.Visibility; }
export interface AliasSig_FnAlias { readonly $tag: "FnAlias"; readonly name: Name; readonly type_name: QualifiedName; readonly loc: basic.Location; }
export type AliasSig = AliasSig_TypeAlias | AliasSig_TraitAlias | AliasSig_FnAlias;

export function AliasSig$TypeAlias(name: Name, type_params: list.List<TypeParamNoConstraints>, type_: syntax.Type, vis: syntax.Visibility): AliasSig_TypeAlias;
export function AliasSig$TraitAlias(name: Name, trait_name: QualifiedName, vis: syntax.Visibility): AliasSig_TraitAlias;
export function AliasSig$FnAlias(name: Name, type_name: QualifiedName, loc: basic.Location): AliasSig_FnAlias;


export interface ConstSig {
  readonly name: Name;
  readonly type_: syntax.Type;
  readonly value: syntax.Constant;
}

export interface FuncSig {
  readonly attr: list.List<[string, string | undefined, string]>;
  readonly type_name: Name | undefined;
  readonly name: Name;
  readonly params: list.List<Parameter>;
  readonly return_: [syntax.Type, syntax.ErrorType];
  readonly type_params: list.List<TypeParamWithConstraints>;
}

export interface ImplSig_Trait { readonly $tag: "Trait"; readonly type_params: list.List<TypeParamWithConstraints>; readonly type_: syntax.Type; readonly trait_name: QualifiedName; }
export interface ImplSig_DefaultImpl { readonly $tag: "DefaultImpl"; readonly trait_name: Name; readonly method_name: Name; }
export type ImplSig = ImplSig_Trait | ImplSig_DefaultImpl;

export function ImplSig$Trait(type_params: list.List<TypeParamWithConstraints>, type_: syntax.Type, trait_name: QualifiedName): ImplSig_Trait;
export function ImplSig$DefaultImpl(trait_name: Name, method_name: Name): ImplSig_DefaultImpl;


export interface Mbti {
  readonly package_name: string;
  readonly imports: list.List<PackageImport>;
  readonly sigs: list.List<[Sig, basic.Location]>;
}

export interface Name {
  readonly name: string;
  readonly loc: basic.Location;
}

export interface PackageImport {
  readonly name: string;
  readonly alias_: string | undefined;
}

export interface Parameter_Positional { readonly $tag: "Positional"; readonly $0: syntax.Type; }
export interface Parameter_Labelled { readonly $tag: "Labelled"; readonly $0: syntax.Label; readonly $1: syntax.Type; }
export interface Parameter_Autofill { readonly $tag: "Autofill"; readonly $0: syntax.Label; readonly $1: syntax.Type; }
export interface Parameter_OptionalDefault { readonly $tag: "OptionalDefault"; readonly $0: syntax.Label; readonly $1: syntax.Type; }
export interface Parameter_OptionalOption { readonly $tag: "OptionalOption"; readonly $0: syntax.Label; readonly $1: syntax.Type; }
export type Parameter = Parameter_Positional | Parameter_Labelled | Parameter_Autofill | Parameter_OptionalDefault | Parameter_OptionalOption;

export function Parameter$Positional($0: syntax.Type): Parameter_Positional;
export function Parameter$Labelled($0: syntax.Label, $1: syntax.Type): Parameter_Labelled;
export function Parameter$Autofill($0: syntax.Label, $1: syntax.Type): Parameter_Autofill;
export function Parameter$OptionalDefault($0: syntax.Label, $1: syntax.Type): Parameter_OptionalDefault;
export function Parameter$OptionalOption($0: syntax.Label, $1: syntax.Type): Parameter_OptionalOption;


export interface QualifiedName {
  readonly name: syntax.LongIdent;
  readonly loc: basic.Location;
}

export interface Sig_Func { readonly $tag: "Func"; readonly $0: FuncSig; }
export interface Sig_Type { readonly $tag: "Type"; readonly $0: TypeSig; }
export interface Sig_Alias { readonly $tag: "Alias"; readonly $0: AliasSig; }
export interface Sig_Trait { readonly $tag: "Trait"; readonly $0: TraitSig; }
export interface Sig_Impl { readonly $tag: "Impl"; readonly $0: ImplSig; }
export interface Sig_Const { readonly $tag: "Const"; readonly $0: ConstSig; }
export interface Sig_Value { readonly $tag: "Value"; readonly $0: ValueSig; }
export type Sig = Sig_Func | Sig_Type | Sig_Alias | Sig_Trait | Sig_Impl | Sig_Const | Sig_Value;

export function Sig$Func($0: FuncSig): Sig_Func;
export function Sig$Type($0: TypeSig): Sig_Type;
export function Sig$Alias($0: AliasSig): Sig_Alias;
export function Sig$Trait($0: TraitSig): Sig_Trait;
export function Sig$Impl($0: ImplSig): Sig_Impl;
export function Sig$Const($0: ConstSig): Sig_Const;
export function Sig$Value($0: ValueSig): Sig_Value;


export interface TraitMethodParameter_Positional { readonly $tag: "Positional"; readonly $0: syntax.Type; }
export interface TraitMethodParameter_Labelled { readonly $tag: "Labelled"; readonly $0: syntax.Label; readonly $1: syntax.Type; }
export type TraitMethodParameter = TraitMethodParameter_Positional | TraitMethodParameter_Labelled;

export function TraitMethodParameter$Positional($0: syntax.Type): TraitMethodParameter_Positional;
export function TraitMethodParameter$Labelled($0: syntax.Label, $1: syntax.Type): TraitMethodParameter_Labelled;


export interface TraitMethodSig {
  readonly name: Name;
  readonly params: list.List<TraitMethodParameter>;
  readonly has_default: boolean;
  readonly return_: [syntax.Type, syntax.ErrorType];
}

export interface TraitSig {
  readonly name: Name;
  readonly super_traits: list.List<QualifiedName>;
  readonly methods: list.List<TraitMethodSig>;
  readonly vis: syntax.Visibility;
}

export interface TypeParamNoConstraints_Name { readonly $tag: "Name"; readonly $0: Name; }
export interface TypeParamNoConstraints_Underscore { readonly $tag: "Underscore"; readonly $0: basic.Location; }
export type TypeParamNoConstraints = TypeParamNoConstraints_Name | TypeParamNoConstraints_Underscore;

export function TypeParamNoConstraints$Name($0: Name): TypeParamNoConstraints_Name;
export function TypeParamNoConstraints$Underscore($0: basic.Location): TypeParamNoConstraints_Underscore;


export interface TypeParamWithConstraints {
  readonly name: Name;
  readonly constraints: list.List<QualifiedName>;
}

export interface TypeSig {
  readonly name: Name;
  readonly type_params: list.List<TypeParamNoConstraints>;
  readonly components: syntax.TypeDesc;
  readonly vis: syntax.Visibility;
}

export interface ValueSig {
  readonly name: Name;
  readonly type_: syntax.Type;
}