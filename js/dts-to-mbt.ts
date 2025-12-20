/**
 * dts-to-mbt - Generate MoonBit FFI bindings from TypeScript .d.ts files
 *
 * Converts TypeScript type definitions to MoonBit extern declarations
 */

import ts from "typescript";

// ============================================================
// Types
// ============================================================

export interface MbtBinding {
  /** Package name for the generated .mbt file */
  packageName: string;
  /** Type definitions (struct, type alias, etc.) */
  types: MbtType[];
  /** Function bindings */
  functions: MbtFunction[];
  /** Extern type declarations */
  externTypes: string[];
  /** Class information for glue code generation */
  classes: MbtClass[];
}

export interface MbtClass {
  name: string;
  typeParams?: string[];
  methods: { name: string; jsName: string }[];
  hasConstructor: boolean;
}

export interface MbtType {
  name: string;
  kind: "struct" | "type" | "enum";
  fields?: MbtField[];
  variants?: MbtVariant[];
  typeParams?: string[];
  jsName?: string; // Original JS name if different
}

export interface MbtField {
  name: string;
  type: string;
  mutable: boolean;
}

export interface MbtVariant {
  name: string;
  payload?: string[];
}

export interface MbtFunction {
  name: string;
  params: MbtParam[];
  returnType: string;
  isAsync: boolean;
  jsName: string; // Original JS name for extern "js"
  typeParams?: string[];
  /** If true, this is a class method using Type::method syntax */
  isMethod?: boolean;
  /** Class name for methods/constructors */
  className?: string;
}

export interface MbtParam {
  name: string;
  type: string;
  optional: boolean;
}

export interface ConvertOptions {
  /** Package name for the generated code */
  packageName?: string;
  /** Prefix for generated type names */
  typePrefix?: string;
  /** Generate async functions as returning Promise */
  usePromise?: boolean;
}

// ============================================================
// TypeScript to MoonBit Type Mapping
// ============================================================

function mapTsTypeToMbt(type: ts.Type, checker: ts.TypeChecker): string {
  const typeString = checker.typeToString(type);
  return mapTypeString(typeString);
}

function mapTypeString(typeString: string): string {
  // Handle basic types
  switch (typeString) {
    case "string":
      return "String";
    case "number":
      return "Int"; // Could also be Double depending on context
    case "boolean":
      return "Bool";
    case "void":
      return "Unit";
    case "undefined":
      return "Unit";
    case "null":
      return "Unit";
    case "any":
      return "Json";
    case "unknown":
      return "Json";
    case "never":
      return "Unit"; // MoonBit doesn't have never
    case "bigint":
      return "BigInt";
    case "symbol":
      return "String"; // Approximate
  }

  // Handle array types
  if (typeString.endsWith("[]")) {
    const elementType = typeString.slice(0, -2);
    return `Array[${mapTypeString(elementType)}]`;
  }

  // Handle Array<T>
  const arrayMatch = typeString.match(/^Array<(.+)>$/);
  if (arrayMatch) {
    return `Array[${mapTypeString(arrayMatch[1])}]`;
  }

  // Handle Promise<T> - use @js.Promise from mizchi/js/js
  const promiseMatch = typeString.match(/^Promise<(.+)>$/);
  if (promiseMatch) {
    return `@js.Promise[${mapTypeString(promiseMatch[1])}]`;
  }

  // Handle Map<K, V>
  const mapMatch = typeString.match(/^Map<(.+),\s*(.+)>$/);
  if (mapMatch) {
    return `Map[${mapTypeString(mapMatch[1])}, ${mapTypeString(mapMatch[2])}]`;
  }

  // Handle Set<T>
  const setMatch = typeString.match(/^Set<(.+)>$/);
  if (setMatch) {
    return `Set[${mapTypeString(setMatch[1])}]`;
  }

  // Handle Uint8Array and other typed arrays
  if (typeString === "Uint8Array") {
    return "Bytes";
  }

  // Handle union types with undefined (optional)
  if (typeString.includes(" | undefined")) {
    const baseType = typeString.replace(" | undefined", "");
    return `${mapTypeString(baseType)}?`;
  }

  // Handle union types with null
  if (typeString.includes(" | null")) {
    const baseType = typeString.replace(" | null", "");
    return `${mapTypeString(baseType)}?`;
  }

  // Keep other types as-is (they may be user-defined types)
  return typeString;
}

// ============================================================
// AST Processing
// ============================================================

function processNode(
  node: ts.Node,
  checker: ts.TypeChecker,
  binding: MbtBinding
): void {
  if (ts.isInterfaceDeclaration(node)) {
    processInterface(node, checker, binding);
  } else if (ts.isTypeAliasDeclaration(node)) {
    processTypeAlias(node, checker, binding);
  } else if (ts.isFunctionDeclaration(node)) {
    processFunction(node, checker, binding);
  } else if (ts.isVariableStatement(node)) {
    processVariableStatement(node, checker, binding);
  } else if (ts.isClassDeclaration(node)) {
    processClass(node, checker, binding);
  } else if (ts.isModuleDeclaration(node)) {
    // Process namespace/module declarations
    if (node.body && ts.isModuleBlock(node.body)) {
      node.body.statements.forEach((stmt) =>
        processNode(stmt, checker, binding)
      );
    }
  }
}

function processInterface(
  node: ts.InterfaceDeclaration,
  checker: ts.TypeChecker,
  binding: MbtBinding
): void {
  const name = node.name.text;
  const fields: MbtField[] = [];
  const typeParams: string[] = [];

  // Process type parameters
  if (node.typeParameters) {
    node.typeParameters.forEach((tp) => {
      typeParams.push(tp.name.text);
    });
  }

  // Process members
  node.members.forEach((member) => {
    if (ts.isPropertySignature(member) && member.name) {
      const propName = member.name.getText();
      const propType = member.type
        ? mapTypeString(member.type.getText())
        : "Json";
      const isOptional = !!member.questionToken;

      fields.push({
        name: toSnakeCase(propName),
        type: isOptional ? `${propType}?` : propType,
        mutable: false,
      });
    }
  });

  binding.types.push({
    name: name,
    kind: "struct",
    fields,
    typeParams: typeParams.length > 0 ? typeParams : undefined,
  });
}

function processClass(
  node: ts.ClassDeclaration,
  checker: ts.TypeChecker,
  binding: MbtBinding
): void {
  if (!node.name) return;

  const className = node.name.text;
  const fields: MbtField[] = [];
  const typeParams: string[] = [];

  // Process type parameters
  if (node.typeParameters) {
    node.typeParameters.forEach((tp) => {
      typeParams.push(tp.name.text);
    });
  }

  // Process members
  node.members.forEach((member) => {
    // Properties
    if (ts.isPropertyDeclaration(member) && member.name) {
      const propName = member.name.getText();
      const propType = member.type
        ? mapTypeString(member.type.getText())
        : "Json";
      const isOptional = !!member.questionToken;
      const isReadonly = member.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ReadonlyKeyword
      );

      fields.push({
        name: toSnakeCase(propName),
        type: isOptional ? `${propType}?` : propType,
        mutable: !isReadonly,
      });
    }

    // Methods -> extern functions
    if (ts.isMethodDeclaration(member) && member.name) {
      const methodName = member.name.getText();
      const params: MbtParam[] = [];
      const methodTypeParams: string[] = [];
      let isAsync = false;

      // Check for async
      if (member.modifiers) {
        isAsync = member.modifiers.some(
          (m) => m.kind === ts.SyntaxKind.AsyncKeyword
        );
      }

      // Process method type parameters
      if (member.typeParameters) {
        member.typeParameters.forEach((tp) => {
          methodTypeParams.push(tp.name.text);
        });
      }

      // Add 'self' as first parameter (the class instance)
      params.push({
        name: "self",
        type: className + (typeParams.length > 0 ? `[${typeParams.join(", ")}]` : ""),
        optional: false,
      });

      // Process method parameters
      member.parameters.forEach((param, i) => {
        const paramName = param.name.getText();
        const paramType = param.type
          ? mapTypeString(param.type.getText())
          : "Json";
        const isOptional = !!param.questionToken || !!param.initializer;

        params.push({
          name: toSnakeCase(paramName),
          type: paramType,
          optional: isOptional,
        });
      });

      // Process return type
      let returnType = "Unit";
      if (member.type) {
        returnType = mapTypeString(member.type.getText());
      }

      binding.functions.push({
        name: `${className}::${toSnakeCase(methodName)}`,
        params,
        returnType,
        isAsync,
        jsName: `${className}.prototype.${methodName}`,
        typeParams: [...typeParams, ...methodTypeParams].length > 0
          ? [...typeParams, ...methodTypeParams]
          : undefined,
        isMethod: true,
        className,
      });
    }

    // Constructor -> ClassName::new
    if (ts.isConstructorDeclaration(member)) {
      const params: MbtParam[] = [];

      member.parameters.forEach((param, i) => {
        const paramName = param.name.getText();
        const paramType = param.type
          ? mapTypeString(param.type.getText())
          : "Json";
        const isOptional = !!param.questionToken || !!param.initializer;

        params.push({
          name: toSnakeCase(paramName),
          type: paramType,
          optional: isOptional,
        });
      });

      binding.functions.push({
        name: `${className}::new`,
        params,
        returnType: className + (typeParams.length > 0 ? `[${typeParams.join(", ")}]` : ""),
        isAsync: false,
        jsName: className,
        typeParams: typeParams.length > 0 ? typeParams : undefined,
        isMethod: true,
        className,
      });
    }
  });

  // Add the class as an extern type
  binding.externTypes.push(
    typeParams.length > 0
      ? `type ${className}[${typeParams.join(", ")}]`
      : `type ${className}`
  );

  // Collect class info for glue code generation
  const classInfo: MbtClass = {
    name: className,
    typeParams: typeParams.length > 0 ? typeParams : undefined,
    methods: [],
    hasConstructor: false,
  };

  node.members.forEach((member) => {
    if (ts.isMethodDeclaration(member) && member.name) {
      const methodName = member.name.getText();
      classInfo.methods.push({
        name: methodName,
        jsName: `${className}.prototype.${methodName}`,
      });
    }
    if (ts.isConstructorDeclaration(member)) {
      classInfo.hasConstructor = true;
    }
  });

  binding.classes.push(classInfo);
}

function processTypeAlias(
  node: ts.TypeAliasDeclaration,
  checker: ts.TypeChecker,
  binding: MbtBinding
): void {
  const name = node.name.text;
  const typeParams: string[] = [];

  // Process type parameters
  if (node.typeParameters) {
    node.typeParameters.forEach((tp) => {
      typeParams.push(tp.name.text);
    });
  }

  // Check if it's a union type (potential enum)
  if (ts.isUnionTypeNode(node.type)) {
    const variants: MbtVariant[] = [];
    let isStringLiteralUnion = true;

    node.type.types.forEach((t) => {
      if (ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal)) {
        variants.push({
          name: toPascalCase(t.literal.text),
        });
      } else {
        isStringLiteralUnion = false;
      }
    });

    if (isStringLiteralUnion && variants.length > 0) {
      binding.types.push({
        name,
        kind: "enum",
        variants,
        typeParams: typeParams.length > 0 ? typeParams : undefined,
      });
      return;
    }
  }

  // Otherwise treat as type alias
  const typeString = mapTypeString(node.type.getText());
  binding.externTypes.push(
    typeParams.length > 0
      ? `type ${name}[${typeParams.join(", ")}]`
      : `type ${name}`
  );
}

function processFunction(
  node: ts.FunctionDeclaration,
  checker: ts.TypeChecker,
  binding: MbtBinding
): void {
  if (!node.name) return;

  const name = node.name.text;
  const params: MbtParam[] = [];
  const typeParams: string[] = [];
  let isAsync = false;

  // Check for async
  if (node.modifiers) {
    isAsync = node.modifiers.some(
      (m) => m.kind === ts.SyntaxKind.AsyncKeyword
    );
  }

  // Process type parameters
  if (node.typeParameters) {
    node.typeParameters.forEach((tp) => {
      typeParams.push(tp.name.text);
    });
  }

  // Process parameters
  node.parameters.forEach((param) => {
    const paramName = param.name.getText();
    const paramType = param.type
      ? mapTypeString(param.type.getText())
      : "Json";
    const isOptional = !!param.questionToken || !!param.initializer;

    params.push({
      name: toSnakeCase(paramName),
      type: paramType,
      optional: isOptional,
    });
  });

  // Process return type
  let returnType = "Unit";
  if (node.type) {
    returnType = mapTypeString(node.type.getText());
  }

  binding.functions.push({
    name: toSnakeCase(name),
    params,
    returnType,
    isAsync,
    jsName: name,
    typeParams: typeParams.length > 0 ? typeParams : undefined,
  });
}

function processVariableStatement(
  node: ts.VariableStatement,
  checker: ts.TypeChecker,
  binding: MbtBinding
): void {
  node.declarationList.declarations.forEach((decl) => {
    if (!ts.isIdentifier(decl.name)) return;

    const name = decl.name.text;

    // Check if it's a function type
    if (decl.type && ts.isFunctionTypeNode(decl.type)) {
      const funcType = decl.type;
      const params: MbtParam[] = [];

      funcType.parameters.forEach((param) => {
        const paramName = param.name.getText();
        const paramType = param.type
          ? mapTypeString(param.type.getText())
          : "Json";

        params.push({
          name: toSnakeCase(paramName),
          type: paramType,
          optional: !!param.questionToken,
        });
      });

      const returnType = funcType.type
        ? mapTypeString(funcType.type.getText())
        : "Unit";

      binding.functions.push({
        name: toSnakeCase(name),
        params,
        returnType,
        isAsync: false,
        jsName: name,
      });
    }
  });
}

// ============================================================
// Code Generation
// ============================================================

export function generateMbt(binding: MbtBinding): string {
  const lines: string[] = [];

  // Package declaration (commented out, user should set appropriately)
  if (binding.packageName) {
    lines.push(`// package "${binding.packageName}"`);
    lines.push("");
  }

  // Extern type declarations (using new #external syntax)
  if (binding.externTypes.length > 0) {
    lines.push("// Extern types");
    binding.externTypes.forEach((t) => {
      lines.push("#external");
      lines.push(t);
      lines.push("");
    });
  }

  // Type definitions
  if (binding.types.length > 0) {
    lines.push("// Types");
    binding.types.forEach((t) => {
      lines.push(generateType(t));
      lines.push("");
    });
  }

  // Function bindings
  if (binding.functions.length > 0) {
    lines.push("// Functions");
    binding.functions.forEach((f) => {
      lines.push(generateFunction(f));
    });
  }

  return lines.join("\n");
}

function generateType(type: MbtType): string {
  const typeParams =
    type.typeParams && type.typeParams.length > 0
      ? `[${type.typeParams.join(", ")}]`
      : "";

  switch (type.kind) {
    case "struct": {
      const fields = type.fields || [];
      if (fields.length === 0) {
        return `pub struct ${type.name}${typeParams} {}`;
      }
      const fieldLines = fields.map(
        (f) => `  ${f.mutable ? "mut " : ""}${f.name} : ${f.type}`
      );
      return `pub struct ${type.name}${typeParams} {\n${fieldLines.join("\n")}\n}`;
    }
    case "enum": {
      const variants = type.variants || [];
      const variantLines = variants.map((v) => {
        if (v.payload && v.payload.length > 0) {
          return `  ${v.name}(${v.payload.join(", ")})`;
        }
        return `  ${v.name}`;
      });
      return `pub enum ${type.name}${typeParams} {\n${variantLines.join("\n")}\n}`;
    }
    case "type":
      return `pub type ${type.name}${typeParams}`;
  }
}

function generateFunction(func: MbtFunction): string {
  const typeParams =
    func.typeParams && func.typeParams.length > 0
      ? `[${func.typeParams.join(", ")}]`
      : "";

  // For extern functions, parameters need names: (arg0 : Type, arg1 : Type)
  const params = func.params
    .map((p, i) => `${p.name || `arg${i}`} : ${p.type}`)
    .join(", ");

  // Don't wrap in Promise if already a Promise type (async functions already have Promise return type)
  const returnType = func.isAsync && !func.returnType.startsWith("Promise[")
    ? `Promise[${func.returnType}]`
    : func.returnType;

  // MoonBit extern fn syntax: extern "js" fn name(params) -> ReturnType = "jsName"
  return `extern "js" fn ${func.name}${typeParams}(${params}) -> ${returnType} = "${func.jsName}"
`;
}

// ============================================================
// Utilities
// ============================================================

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// ============================================================
// Main API
// ============================================================

/**
 * Parse a .d.ts file and generate MoonBit bindings
 */
export function parseDts(
  content: string,
  filename: string,
  options: ConvertOptions = {}
): MbtBinding {
  const sourceFile = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  // Create a minimal program for type checking
  const compilerHost: ts.CompilerHost = {
    getSourceFile: (name) =>
      name === filename ? sourceFile : undefined,
    getDefaultLibFileName: () => "lib.d.ts",
    writeFile: () => {},
    getCurrentDirectory: () => "",
    getCanonicalFileName: (f) => f,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
    fileExists: (f) => f === filename,
    readFile: () => undefined,
  };

  const program = ts.createProgram([filename], {}, compilerHost);
  const checker = program.getTypeChecker();

  const binding: MbtBinding = {
    packageName: options.packageName || "",
    types: [],
    functions: [],
    externTypes: [],
    classes: [],
  };

  sourceFile.statements.forEach((stmt) => {
    processNode(stmt, checker, binding);
  });

  return binding;
}

/**
 * Convert a .d.ts file content to MoonBit code
 */
export function dtsToMbt(
  content: string,
  filename: string,
  options: ConvertOptions = {}
): string {
  const binding = parseDts(content, filename, options);
  return generateMbt(binding);
}

/**
 * Generate JavaScript glue code for class bindings
 * This creates factory functions and method wrappers needed for MoonBit FFI
 */
export function generateGlueCode(binding: MbtBinding, modulePath: string): string {
  if (binding.classes.length === 0) {
    return "";
  }

  const lines: string[] = [];
  lines.push(`// Generated glue code for MoonBit FFI`);
  lines.push(`// Import the original module`);
  lines.push(`import * as _original from '${modulePath}';`);
  lines.push("");

  binding.classes.forEach((cls) => {
    const className = cls.name;

    // Factory function (constructor without 'new')
    if (cls.hasConstructor) {
      lines.push(`// Factory function for ${className} (called without 'new')`);
      lines.push(`export function ${className}(...args) {`);
      lines.push(`  return new _original.${className}(...args);`);
      lines.push(`}`);
      lines.push("");
    }

    // Method wrappers (accept self as first argument)
    if (cls.methods.length > 0) {
      lines.push(`// Method wrappers for ${className}`);
      lines.push(`${className}.prototype = Object.create(_original.${className}.prototype);`);
      lines.push("");

      cls.methods.forEach((method) => {
        lines.push(`${className}.prototype.${method.name} = function(self, ...args) {`);
        lines.push(`  return _original.${className}.prototype.${method.name}.call(self, ...args);`);
        lines.push(`};`);
      });
      lines.push("");
    }
  });

  // Re-export non-class items
  lines.push(`// Re-export other items`);
  lines.push(`export * from '${modulePath}';`);

  return lines.join("\n");
}

/**
 * Convert a .d.ts file and generate both .mbt and glue .js
 */
export function dtsToMbtWithGlue(
  content: string,
  filename: string,
  modulePath: string,
  options: ConvertOptions = {}
): { mbt: string; glue: string } {
  const binding = parseDts(content, filename, options);
  return {
    mbt: generateMbt(binding),
    glue: generateGlueCode(binding, modulePath),
  };
}
