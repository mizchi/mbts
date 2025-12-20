// package "demo"

// Types
pub enum Status {
  Pending
  Active
  Done
}

pub enum Color {
  Red
  Green
  Blue
}

// Functions
extern "js" fn get_status() -> Status = "getStatus"
