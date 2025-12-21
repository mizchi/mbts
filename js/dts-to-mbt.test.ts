import { describe, it, expect } from "vitest";
import { parseDts, dtsToMbt, generateMbt, generateMbti, generateGlueCode, dtsToMbtWithGlue, dtsToMbtWithMbti } from "./dts-to-mbt.ts";

describe("parseDts", () => {
  it("should parse interface to struct", () => {
    const dts = `
export interface User {
  name: string;
  age: number;
}
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.types).toMatchInlineSnapshot(`
      [
        {
          "fields": [
            {
              "mutable": false,
              "name": "name",
              "type": "String",
            },
            {
              "mutable": false,
              "name": "age",
              "type": "Int",
            },
          ],
          "kind": "struct",
          "name": "User",
          "typeParams": undefined,
        },
      ]
    `);
  });

  it("should parse interface with optional fields", () => {
    const dts = `
export interface Config {
  host: string;
  port?: number;
}
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.types[0].fields).toMatchInlineSnapshot(`
      [
        {
          "mutable": false,
          "name": "host",
          "type": "String",
        },
        {
          "mutable": false,
          "name": "port",
          "type": "Int?",
        },
      ]
    `);
  });

  it("should parse function declaration", () => {
    const dts = `
export function greet(name: string): string;
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.functions).toMatchInlineSnapshot(`
      [
        {
          "isAsync": false,
          "jsName": "greet",
          "name": "greet",
          "params": [
            {
              "name": "name",
              "optional": false,
              "type": "String",
            },
          ],
          "returnType": "String",
          "typeParams": undefined,
        },
      ]
    `);
  });

  it("should parse async function", () => {
    const dts = `
export async function fetchData(url: string): Promise<string>;
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.functions).toMatchInlineSnapshot(`
      [
        {
          "isAsync": true,
          "jsName": "fetchData",
          "name": "fetch_data",
          "params": [
            {
              "name": "url",
              "optional": false,
              "type": "String",
            },
          ],
          "returnType": "@js.Promise[String]",
          "typeParams": undefined,
        },
      ]
    `);
  });

  it("should parse string literal union as enum", () => {
    const dts = `
export type Status = "pending" | "active" | "done";
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.types).toMatchInlineSnapshot(`
      [
        {
          "kind": "enum",
          "name": "Status",
          "typeParams": undefined,
          "variants": [
            {
              "name": "Pending",
            },
            {
              "name": "Active",
            },
            {
              "name": "Done",
            },
          ],
        },
      ]
    `);
  });

  it("should parse generic interface", () => {
    const dts = `
export interface Result<T, E> {
  value: T;
  error: E;
}
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.types).toMatchInlineSnapshot(`
      [
        {
          "fields": [
            {
              "mutable": false,
              "name": "value",
              "type": "T",
            },
            {
              "mutable": false,
              "name": "error",
              "type": "E",
            },
          ],
          "kind": "struct",
          "name": "Result",
          "typeParams": [
            "T",
            "E",
          ],
        },
      ]
    `);
  });

  it("should handle array types", () => {
    const dts = `
export interface Container {
  items: string[];
  numbers: Array<number>;
}
`;
    const binding = parseDts(dts, "test.d.ts");
    expect(binding.types[0].fields).toMatchInlineSnapshot(`
      [
        {
          "mutable": false,
          "name": "items",
          "type": "Array[String]",
        },
        {
          "mutable": false,
          "name": "numbers",
          "type": "Array[Int]",
        },
      ]
    `);
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
    expect(mbt).toMatchInlineSnapshot(`
      "// Types
      pub struct Point {
        x : Int
        y : Int
      }
      "
    `);
  });

  it("should generate extern function with js binding", () => {
    const binding = parseDts(
      `
export function calculateSum(a: number, b: number): number;
`,
      "test.d.ts"
    );
    const mbt = generateMbt(binding);
    expect(mbt).toMatchInlineSnapshot(`
      "// Functions
      extern "js" fn calculate_sum(a : Int, b : Int) -> Int = "calculateSum"
      "
    `);
  });

  it("should generate enum from string literal union", () => {
    const binding = parseDts(
      `
export type Color = "red" | "green" | "blue";
`,
      "test.d.ts"
    );
    const mbt = generateMbt(binding);
    expect(mbt).toMatchInlineSnapshot(`
      "// Types
      pub enum Color {
        Red
        Green
        Blue
      }
      "
    `);
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
    expect(mbt).toMatchInlineSnapshot(`
      "// package "my/package"

      // Types
      pub struct User {
        id : Int
        name : String
        email : String?
      }

      // Functions
      extern "js" fn create_user(name : String, email : String) -> User = "createUser"

      extern "js" fn get_user(id : Int) -> User? = "getUser"
      "
    `);
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
    expect(mbt).toMatchInlineSnapshot(`
      "// Functions
      extern "js" fn process(data : Bytes, flag : Bool, count : BigInt) -> Unit = "process"
      "
    `);
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
    expect({
      externTypes: binding.externTypes,
      functions: binding.functions,
      classes: binding.classes
    }).toMatchInlineSnapshot(`
      {
        "classes": [
          {
            "hasConstructor": true,
            "methods": [
              {
                "jsName": "Counter.prototype.increment",
                "name": "increment",
              },
              {
                "jsName": "Counter.prototype.decrement",
                "name": "decrement",
              },
              {
                "jsName": "Counter.prototype.getValue",
                "name": "getValue",
              },
            ],
            "name": "Counter",
            "typeParams": undefined,
          },
        ],
        "externTypes": [
          "type Counter",
        ],
        "functions": [
          {
            "className": "Counter",
            "isAsync": false,
            "isMethod": true,
            "jsName": "Counter",
            "name": "Counter::new",
            "params": [
              {
                "name": "initial",
                "optional": false,
                "type": "Int",
              },
            ],
            "returnType": "Counter",
            "typeParams": undefined,
          },
          {
            "className": "Counter",
            "isAsync": false,
            "isMethod": true,
            "jsName": "Counter.prototype.increment",
            "name": "Counter::increment",
            "params": [
              {
                "name": "self",
                "optional": false,
                "type": "Counter",
              },
            ],
            "returnType": "Unit",
            "typeParams": undefined,
          },
          {
            "className": "Counter",
            "isAsync": false,
            "isMethod": true,
            "jsName": "Counter.prototype.decrement",
            "name": "Counter::decrement",
            "params": [
              {
                "name": "self",
                "optional": false,
                "type": "Counter",
              },
            ],
            "returnType": "Unit",
            "typeParams": undefined,
          },
          {
            "className": "Counter",
            "isAsync": false,
            "isMethod": true,
            "jsName": "Counter.prototype.getValue",
            "name": "Counter::get_value",
            "params": [
              {
                "name": "self",
                "optional": false,
                "type": "Counter",
              },
            ],
            "returnType": "Int",
            "typeParams": undefined,
          },
        ],
      }
    `);
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
    expect(mbt).toMatchInlineSnapshot(`
      "// Extern types
      #external
      type HttpClient

      // Functions
      extern "js" fn HttpClient::new(base_url : String) -> HttpClient =
        #| (base_url) => new HttpClient(base_url)

      extern "js" fn HttpClient::get(self : HttpClient, path : String) -> @js.Promise[String] =
        #| (self, path) => self.get(path)

      extern "js" fn HttpClient::post(self : HttpClient, path : String, body : String) -> @js.Promise[String] =
        #| (self, path, body) => self.post(path, body)
      "
    `);
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
    expect({
      externTypes: binding.externTypes,
      functions: binding.functions.map(f => ({
        name: f.name,
        typeParams: f.typeParams,
        returnType: f.returnType
      }))
    }).toMatchInlineSnapshot(`
      {
        "externTypes": [
          "type Container[T]",
        ],
        "functions": [
          {
            "name": "Container::new",
            "returnType": "Container[T]",
            "typeParams": [
              "T",
            ],
          },
          {
            "name": "Container::get",
            "returnType": "T",
            "typeParams": [
              "T",
            ],
          },
          {
            "name": "Container::set",
            "returnType": "Unit",
            "typeParams": [
              "T",
            ],
          },
        ],
      }
    `);
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
    expect(glue).toMatchInlineSnapshot(`
      "// Generated glue code for MoonBit FFI
      // Import the original module
      import * as _original from './counter.js';

      // Factory function for Counter (called without 'new')
      export function Counter(...args) {
        return new _original.Counter(...args);
      }

      // Method wrappers for Counter
      Counter.prototype = Object.create(_original.Counter.prototype);

      Counter.prototype.increment = function(self, ...args) {
        return _original.Counter.prototype.increment.call(self, ...args);
      };
      Counter.prototype.getValue = function(self, ...args) {
        return _original.Counter.prototype.getValue.call(self, ...args);
      };

      // Re-export other items
      export * from './counter.js';"
    `);
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
    expect(result).toMatchInlineSnapshot(`
      {
        "glue": "// Generated glue code for MoonBit FFI
      // Import the original module
      import * as _original from './timer.js';

      // Factory function for Timer (called without 'new')
      export function Timer(...args) {
        return new _original.Timer(...args);
      }

      // Method wrappers for Timer
      Timer.prototype = Object.create(_original.Timer.prototype);

      Timer.prototype.start = function(self, ...args) {
        return _original.Timer.prototype.start.call(self, ...args);
      };
      Timer.prototype.stop = function(self, ...args) {
        return _original.Timer.prototype.stop.call(self, ...args);
      };

      // Re-export other items
      export * from './timer.js';",
        "mbt": "// Extern types
      #external
      type Timer

      // Functions
      extern "js" fn Timer::new() -> Timer =
        #| () => new Timer()

      extern "js" fn Timer::start(self : Timer) -> Unit =
        #| (self) => self.start()

      extern "js" fn Timer::stop(self : Timer) -> Unit =
        #| (self) => self.stop()

      extern "js" fn create_timer() -> Timer = "createTimer"
      ",
      }
    `);
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
    expect(mbt).toMatchInlineSnapshot(`
      "// Types
      pub struct Element {
        tag_name : String
        id : String
        class_name : String
        inner_h_t_m_l : String
      }

      pub struct Document {
        body : Element
        title : String
      }

      // Functions
      extern "js" fn get_element_by_id(id : String) -> Element? = "getElementById"

      extern "js" fn create_element(tag_name : String) -> Element = "createElement"

      extern "js" fn query_selector(selector : String) -> Element? = "querySelector"
      "
    `);
  });
});

describe("generateMbti", () => {
  it("should generate .mbti from struct binding", () => {
    const binding = parseDts(
      `
export interface User {
  name: string;
  age: number;
}
`,
      "test.d.ts",
      { packageName: "myapp/user" }
    );
    const mbti = generateMbti(binding);
    expect(mbti).toMatchInlineSnapshot(`
      "// Generated from .d.ts by mbts
      package "myapp/user"

      // Types and methods
      pub struct User {
        name : String
        age : Int
      }
      "
    `);
  });

  it("should generate .mbti with functions", () => {
    const binding = parseDts(
      `
export function greet(name: string): string;
export function add(a: number, b: number): number;
`,
      "test.d.ts"
    );
    const mbti = generateMbti(binding);
    expect(mbti).toMatchInlineSnapshot(`
      "// Generated from .d.ts by mbts

      pub fn greet(String) -> String
      pub fn add(Int, Int) -> Int
      "
    `);
  });

  it("should generate .mbti with class methods", () => {
    const binding = parseDts(
      `
export class Counter {
  constructor(initial: number);
  increment(): void;
  getValue(): number;
}
`,
      "test.d.ts"
    );
    const mbti = generateMbti(binding);
    expect(mbti).toMatchInlineSnapshot(`
      "// Generated from .d.ts by mbts

      // Types and methods
      pub type Counter

      pub fn Counter::new(Int) -> Counter
      pub fn Counter::increment(Counter) -> Unit
      pub fn Counter::get_value(Counter) -> Int
      "
    `);
  });

  it("should generate .mbti with enum", () => {
    const binding = parseDts(
      `
export type Status = "pending" | "active" | "done";
`,
      "test.d.ts"
    );
    const mbti = generateMbti(binding);
    expect(mbti).toMatchInlineSnapshot(`
      "// Generated from .d.ts by mbts

      // Types and methods
      pub enum Status {
        Pending
        Active
        Done
      }
      "
    `);
  });

  it("should generate .mbti with generic types", () => {
    const binding = parseDts(
      `
export interface Result<T, E> {
  value: T;
  error: E;
}
export class Container<T> {
  constructor(value: T);
  get(): T;
}
`,
      "test.d.ts"
    );
    const mbti = generateMbti(binding);
    expect(mbti).toMatchInlineSnapshot(`
      "// Generated from .d.ts by mbts

      // Types and methods
      pub type Container[T]
      pub struct Result[T, E] {
        value : T
        error : E
      }

      pub fn[T] Container::new(T) -> Container[T]
      pub fn[T] Container::get(Container[T]) -> T
      "
    `);
  });
});

describe("dtsToMbtWithMbti", () => {
  it("should generate both .mbt and .mbti", () => {
    const dts = `
export interface User {
  name: string;
  age: number;
}
export function createUser(name: string): User;
`;
    const result = dtsToMbtWithMbti(dts, "test.d.ts", { packageName: "myapp" });

    expect(result.mbt).toContain("pub struct User");
    expect(result.mbt).toContain('extern "js" fn create_user');

    expect(result.mbti).toContain('package "myapp"');
    expect(result.mbti).toContain("pub struct User");
    expect(result.mbti).toContain("pub fn create_user(String) -> User");
  });
});
