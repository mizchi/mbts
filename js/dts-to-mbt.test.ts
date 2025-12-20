import { describe, it, expect } from "vitest";
import { parseDts, dtsToMbt, generateMbt, generateGlueCode, dtsToMbtWithGlue } from "./dts-to-mbt.js";

describe("parseDts", () => {
  it("should parse interface to struct", () => {
    const dts = `
export interface User {
  name: string;
  age: number;
}
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.types.length).toBe(1);
    expect(binding.types[0].name).toBe("User");
    expect(binding.types[0].kind).toBe("struct");
    expect(binding.types[0].fields).toHaveLength(2);
    expect(binding.types[0].fields![0].name).toBe("name");
    expect(binding.types[0].fields![0].type).toBe("String");
    expect(binding.types[0].fields![1].name).toBe("age");
    expect(binding.types[0].fields![1].type).toBe("Int");
  });

  it("should parse interface with optional fields", () => {
    const dts = `
export interface Config {
  host: string;
  port?: number;
}
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.types[0].fields![0].type).toBe("String");
    expect(binding.types[0].fields![1].type).toBe("Int?");
  });

  it("should parse function declaration", () => {
    const dts = `
export function greet(name: string): string;
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.functions.length).toBe(1);
    expect(binding.functions[0].name).toBe("greet");
    expect(binding.functions[0].jsName).toBe("greet");
    expect(binding.functions[0].params).toHaveLength(1);
    expect(binding.functions[0].params[0].type).toBe("String");
    expect(binding.functions[0].returnType).toBe("String");
  });

  it("should parse async function", () => {
    const dts = `
export async function fetchData(url: string): Promise<string>;
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.functions[0].isAsync).toBe(true);
    expect(binding.functions[0].returnType).toBe("@js.Promise[String]");
  });

  it("should parse string literal union as enum", () => {
    const dts = `
export type Status = "pending" | "active" | "done";
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.types.length).toBe(1);
    expect(binding.types[0].kind).toBe("enum");
    expect(binding.types[0].variants).toHaveLength(3);
    expect(binding.types[0].variants![0].name).toBe("Pending");
    expect(binding.types[0].variants![1].name).toBe("Active");
    expect(binding.types[0].variants![2].name).toBe("Done");
  });

  it("should parse generic interface", () => {
    const dts = `
export interface Result<T, E> {
  value: T;
  error: E;
}
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.types[0].typeParams).toEqual(["T", "E"]);
  });

  it("should handle array types", () => {
    const dts = `
export interface Container {
  items: string[];
  numbers: Array<number>;
}
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.types[0].fields![0].type).toBe("Array[String]");
    expect(binding.types[0].fields![1].type).toBe("Array[Int]");
  });
});

describe("generateMbt", () => {
  it("should generate struct from binding", () => {
    const binding = parseDts(
      `
export interface Point {
  x: number;
  y: number;
}
`,
      "test.d.ts"
    );
    const mbt = generateMbt(binding);
    expect(mbt).toContain("pub struct Point");
    expect(mbt).toContain("x : Int");
    expect(mbt).toContain("y : Int");
  });

  it("should generate extern function with js binding", () => {
    const binding = parseDts(
      `
export function calculateSum(a: number, b: number): number;
`,
      "test.d.ts"
    );
    const mbt = generateMbt(binding);
    expect(mbt).toContain('extern "js" fn calculate_sum');
    expect(mbt).toContain('= "calculateSum"');
    expect(mbt).toContain("-> Int");
  });

  it("should generate enum from string literal union", () => {
    const binding = parseDts(
      `
export type Color = "red" | "green" | "blue";
`,
      "test.d.ts"
    );
    const mbt = generateMbt(binding);
    expect(mbt).toContain("pub enum Color");
    expect(mbt).toContain("Red");
    expect(mbt).toContain("Green");
    expect(mbt).toContain("Blue");
  });
});

describe("dtsToMbt", () => {
  it("should convert complete .d.ts to .mbt", () => {
    const dts = `
export interface User {
  id: number;
  name: string;
  email?: string;
}

export function createUser(name: string, email?: string): User;
export function getUser(id: number): User | undefined;
`;
    const mbt = dtsToMbt(dts, "test.d.ts", { packageName: "my/package" });

    expect(mbt).toContain('// package "my/package"');
    expect(mbt).toContain("pub struct User");
    expect(mbt).toContain("id : Int");
    expect(mbt).toContain("name : String");
    expect(mbt).toContain("email : String?");
    expect(mbt).toContain('extern "js" fn create_user');
    expect(mbt).toContain('= "createUser"');
    expect(mbt).toContain('extern "js" fn get_user');
    expect(mbt).toContain('= "getUser"');
  });

  it("should handle TypeScript built-in types", () => {
    const dts = `
export function process(
  data: Uint8Array,
  flag: boolean,
  count: bigint
): void;
`;
    const mbt = dtsToMbt(dts, "test.d.ts");
    expect(mbt).toContain("Bytes");
    expect(mbt).toContain("Bool");
    expect(mbt).toContain("BigInt");
    expect(mbt).toContain("-> Unit");
  });
});

describe("class conversion", () => {
  it("should convert class to extern type and methods", () => {
    const dts = `
export class Counter {
  value: number;
  constructor(initial: number);
  increment(): void;
  decrement(): void;
  getValue(): number;
}
`;
    const binding = parseDts(dts, "test.d.ts");

    // Should have extern type
    expect(binding.externTypes).toContain("type Counter");

    // Should have constructor with Type::new format
    const ctorFn = binding.functions.find((f) => f.name === "Counter::new");
    expect(ctorFn).toBeDefined();
    expect(ctorFn?.returnType).toBe("Counter");
    expect(ctorFn?.isMethod).toBe(true);
    expect(ctorFn?.className).toBe("Counter");

    // Should have methods with Type::method format and self parameter
    const incrFn = binding.functions.find((f) => f.name === "Counter::increment");
    expect(incrFn).toBeDefined();
    expect(incrFn?.params[0].name).toBe("self");
    expect(incrFn?.params[0].type).toBe("Counter");
    expect(incrFn?.isMethod).toBe(true);

    // Should have class info for glue code generation
    expect(binding.classes).toHaveLength(1);
    expect(binding.classes[0].name).toBe("Counter");
    expect(binding.classes[0].hasConstructor).toBe(true);
  });

  it("should generate correct MoonBit code for class", () => {
    const dts = `
export class HttpClient {
  baseUrl: string;
  constructor(baseUrl: string);
  get(path: string): Promise<string>;
  post(path: string, body: string): Promise<string>;
}
`;
    const mbt = dtsToMbt(dts, "test.d.ts");

    // New #external syntax
    expect(mbt).toContain("#external");
    expect(mbt).toContain("type HttpClient");
    // Type::method format
    expect(mbt).toContain('extern "js" fn HttpClient::new');
    expect(mbt).toContain('= "HttpClient"');
    expect(mbt).toContain('extern "js" fn HttpClient::get');
    expect(mbt).toContain('extern "js" fn HttpClient::post');
    // @js.Promise
    expect(mbt).toContain("@js.Promise[String]");
  });

  it("should handle generic class", () => {
    const dts = `
export class Container<T> {
  value: T;
  constructor(value: T);
  get(): T;
  set(value: T): void;
}
`;
    const binding = parseDts(dts, "test.d.ts");

    expect(binding.externTypes).toContain("type Container[T]");

    const ctorFn = binding.functions.find((f) => f.name === "Container::new");
    expect(ctorFn?.typeParams).toContain("T");
    expect(ctorFn?.returnType).toBe("Container[T]");
  });

  it("should generate glue code for class", () => {
    const dts = `
export class Counter {
  constructor(initial: number);
  increment(): number;
  getValue(): number;
}
`;
    const binding = parseDts(dts, "test.d.ts");
    const glue = generateGlueCode(binding, "./counter.js");

    // Should have factory function
    expect(glue).toContain("export function Counter(...args)");
    expect(glue).toContain("new _original.Counter(...args)");

    // Should have method wrappers
    expect(glue).toContain("Counter.prototype.increment = function(self, ...args)");
    expect(glue).toContain("Counter.prototype.getValue = function(self, ...args)");

    // Should re-export other items
    expect(glue).toContain("export * from './counter.js'");
  });

  it("should generate both .mbt and glue code with dtsToMbtWithGlue", () => {
    const dts = `
export class Timer {
  constructor();
  start(): void;
  stop(): void;
}
export function createTimer(): Timer;
`;
    const result = dtsToMbtWithGlue(dts, "test.d.ts", "./timer.js");

    // Should have .mbt content
    expect(result.mbt).toContain("#external");
    expect(result.mbt).toContain("type Timer");
    expect(result.mbt).toContain("Timer::new");
    expect(result.mbt).toContain("Timer::start");

    // Should have glue code
    expect(result.glue).toContain("export function Timer");
    expect(result.glue).toContain("Timer.prototype.start");
  });
});

describe("real world: DOM API subset", () => {
  it("should convert DOM-like API", () => {
    const dts = `
export interface Element {
  tagName: string;
  id: string;
  className: string;
  innerHTML: string;
}

export interface Document {
  body: Element;
  title: string;
}

export function getElementById(id: string): Element | undefined;
export function createElement(tagName: string): Element;
export function querySelector(selector: string): Element | undefined;
`;
    const mbt = dtsToMbt(dts, "dom.d.ts");

    expect(mbt).toContain("pub struct Element");
    expect(mbt).toContain("pub struct Document");
    expect(mbt).toContain('extern "js" fn get_element_by_id');
    expect(mbt).toContain('extern "js" fn create_element');
    expect(mbt).toContain('extern "js" fn query_selector');
  });
});
