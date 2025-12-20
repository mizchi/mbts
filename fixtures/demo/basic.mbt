// package "demo"

// Types
pub struct User {
  id : Int
  name : String
  email : String?
}

// Functions
extern "js" fn create_user(name : String) -> User = "createUser"

extern "js" fn get_user(id : Int) -> User? = "getUser"
