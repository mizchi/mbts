// Generated from .mbti file - DO NOT EDIT

export interface AliasSig_TypeAlias { readonly $tag: "TypeAlias"; readonly name: Name; readonly type_params: any /* TODO: @list.List */; readonly type_: any /* TODO: @syntax.Type */; readonly vis: any /* TODO: @syntax.Visibility */; }
export interface AliasSig_TraitAlias { readonly $tag: "TraitAlias"; readonly name: Name; readonly trait_name: QualifiedName; readonly vis: any /* TODO: @syntax.Visibility */; }
export interface AliasSig_FnAlias { readonly $tag: "FnAlias"; readonly name: Name; readonly type_name: QualifiedName; readonly loc: any /* TODO: @basic.Location */; }
export type AliasSig = AliasSig_TypeAlias | AliasSig_TraitAlias | AliasSig_FnAlias;

export function AliasSig$TypeAlias(name: Name, type_params: any /* TODO: @list.List */, type_: any /* TODO: @syntax.Type */, vis: any /* TODO: @syntax.Visibility */): AliasSig_TypeAlias;
export function AliasSig$TraitAlias(name: Name, trait_name: QualifiedName, vis: any /* TODO: @syntax.Visibility */): AliasSig_TraitAlias;
export function AliasSig$FnAlias(name: Name, type_name: QualifiedName, loc: any /* TODO: @basic.Location */): AliasSig_FnAlias;


export interface ConstSig {
  readonly name: Name;
  readonly type_: any /* TODO: @syntax.Type */;
  readonly value: any /* TODO: @syntax.Constant */;
}

export interface FuncSig {
  readonly attr: any /* TODO: @list.List */;
  readonly type_name: Name | undefined;
  readonly name: Name;
  readonly params: any /* TODO: @list.List */;
  readonly return_: [any /* TODO: @syntax.Type */, any /* TODO: @syntax.ErrorType */];
  readonly type_params: any /* TODO: @list.List */;
}

export interface ImplSig_Trait { readonly $tag: "Trait"; readonly type_params: any /* TODO: @list.List */; readonly type_: any /* TODO: @syntax.Type */; readonly trait_name: QualifiedName; }
export interface ImplSig_DefaultImpl { readonly $tag: "DefaultImpl"; readonly trait_name: Name; readonly method_name: Name; }
export type ImplSig = ImplSig_Trait | ImplSig_DefaultImpl;

export function ImplSig$Trait(type_params: any /* TODO: @list.List */, type_: any /* TODO: @syntax.Type */, trait_name: QualifiedName): ImplSig_Trait;
export function ImplSig$DefaultImpl(trait_name: Name, method_name: Name): ImplSig_DefaultImpl;


export interface Mbti {
  readonly package_name: string;
  readonly imports: any /* TODO: @list.List */;
  readonly sigs: any /* TODO: @list.List */;
}

export interface Name {
  readonly name: string;
  readonly loc: any /* TODO: @basic.Location */;
}

export interface PackageImport {
  readonly name: string;
  readonly alias_: string | undefined;
}

export interface Parameter_Positional { readonly $tag: "Positional"; readonly $0: any /* TODO: @syntax.Type */; }
export interface Parameter_Labelled { readonly $tag: "Labelled"; readonly $0: any /* TODO: @syntax.Label */; readonly $1: any /* TODO: @syntax.Type */; }
export interface Parameter_Autofill { readonly $tag: "Autofill"; readonly $0: any /* TODO: @syntax.Label */; readonly $1: any /* TODO: @syntax.Type */; }
export interface Parameter_OptionalDefault { readonly $tag: "OptionalDefault"; readonly $0: any /* TODO: @syntax.Label */; readonly $1: any /* TODO: @syntax.Type */; }
export interface Parameter_OptionalOption { readonly $tag: "OptionalOption"; readonly $0: any /* TODO: @syntax.Label */; readonly $1: any /* TODO: @syntax.Type */; }
export type Parameter = Parameter_Positional | Parameter_Labelled | Parameter_Autofill | Parameter_OptionalDefault | Parameter_OptionalOption;

export function Parameter$Positional($0: any /* TODO: @syntax.Type */): Parameter_Positional;
export function Parameter$Labelled($0: any /* TODO: @syntax.Label */, $1: any /* TODO: @syntax.Type */): Parameter_Labelled;
export function Parameter$Autofill($0: any /* TODO: @syntax.Label */, $1: any /* TODO: @syntax.Type */): Parameter_Autofill;
export function Parameter$OptionalDefault($0: any /* TODO: @syntax.Label */, $1: any /* TODO: @syntax.Type */): Parameter_OptionalDefault;
export function Parameter$OptionalOption($0: any /* TODO: @syntax.Label */, $1: any /* TODO: @syntax.Type */): Parameter_OptionalOption;


export interface QualifiedName {
  readonly name: any /* TODO: @syntax.LongIdent */;
  readonly loc: any /* TODO: @basic.Location */;
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


export interface TraitMethodParameter_Positional { readonly $tag: "Positional"; readonly $0: any /* TODO: @syntax.Type */; }
export interface TraitMethodParameter_Labelled { readonly $tag: "Labelled"; readonly $0: any /* TODO: @syntax.Label */; readonly $1: any /* TODO: @syntax.Type */; }
export type TraitMethodParameter = TraitMethodParameter_Positional | TraitMethodParameter_Labelled;

export function TraitMethodParameter$Positional($0: any /* TODO: @syntax.Type */): TraitMethodParameter_Positional;
export function TraitMethodParameter$Labelled($0: any /* TODO: @syntax.Label */, $1: any /* TODO: @syntax.Type */): TraitMethodParameter_Labelled;


export interface TraitMethodSig {
  readonly name: Name;
  readonly params: any /* TODO: @list.List */;
  readonly has_default: boolean;
  readonly return_: [any /* TODO: @syntax.Type */, any /* TODO: @syntax.ErrorType */];
}

export interface TraitSig {
  readonly name: Name;
  readonly super_traits: any /* TODO: @list.List */;
  readonly methods: any /* TODO: @list.List */;
  readonly vis: any /* TODO: @syntax.Visibility */;
}

export interface TypeParamNoConstraints_Name { readonly $tag: "Name"; readonly $0: Name; }
export interface TypeParamNoConstraints_Underscore { readonly $tag: "Underscore"; readonly $0: any /* TODO: @basic.Location */; }
export type TypeParamNoConstraints = TypeParamNoConstraints_Name | TypeParamNoConstraints_Underscore;

export function TypeParamNoConstraints$Name($0: Name): TypeParamNoConstraints_Name;
export function TypeParamNoConstraints$Underscore($0: any /* TODO: @basic.Location */): TypeParamNoConstraints_Underscore;


export interface TypeParamWithConstraints {
  readonly name: Name;
  readonly constraints: any /* TODO: @list.List */;
}

export interface TypeSig {
  readonly name: Name;
  readonly type_params: any /* TODO: @list.List */;
  readonly components: any /* TODO: @syntax.TypeDesc */;
  readonly vis: any /* TODO: @syntax.Visibility */;
}

export interface ValueSig {
  readonly name: Name;
  readonly type_: any /* TODO: @syntax.Type */;
}