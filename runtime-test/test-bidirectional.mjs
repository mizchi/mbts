// Test bidirectional conversion: .mbti → .d.ts → .mbt
import { generateDts, parseMbtiOrThrow } from '../js/index.ts';
import { dtsToMbt } from '../js/dts-to-mbt.ts';

// Sample .mbti content (simpler version)
const mbti = `
package "test"

pub struct User {
  name : String
  age : Int
}

pub enum Status {
  Pending
  Active
  Done
}

pub fn create_user(String, Int) -> User

pub fn get_user_name(User) -> String

pub fn process_items(Array[String]) -> Int
`;

console.log("=== Original .mbti ===");
console.log(mbti);

// Step 1: .mbti → .d.ts
console.log("\n=== Step 1: .mbti → .d.ts ===");
const dts = generateDts(mbti, "test.mbti");
console.log(dts);

// Step 2: .d.ts → .mbt
console.log("\n=== Step 2: .d.ts → .mbt ===");
const mbt = dtsToMbt(dts, "test.d.ts");
console.log(mbt);

// Analysis
console.log("\n=== Analysis ===");
console.log("Original types: User (struct), Status (enum)");
console.log("Original functions: create_user, get_user_name, process_items");

// Check what was preserved
const hasUser = mbt.includes("User");
const hasStatus = mbt.includes("Status");
const hasCreateUser = mbt.includes("create_user");
const hasGetUserName = mbt.includes("get_user_name");
const hasProcessItems = mbt.includes("process_items");

console.log("\nPreserved in .mbt:");
console.log(`  - User type: ${hasUser ? "✅" : "❌"}`);
console.log(`  - Status enum: ${hasStatus ? "✅" : "❌"}`);
console.log(`  - create_user function: ${hasCreateUser ? "✅" : "❌"}`);
console.log(`  - get_user_name function: ${hasGetUserName ? "✅" : "❌"}`);
console.log(`  - process_items function: ${hasProcessItems ? "✅" : "❌"}`);
