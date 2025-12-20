// package "demo"

// Extern types
#external
type ApiClient

// Types
pub struct ApiResponse {
  data : String
  status : Int
}

// Functions
extern "js" fn fetch_data(url : String) -> @js.Promise[ApiResponse] = "fetchData"

extern "js" fn fetch_all(urls : Array[String]) -> @js.Promise[Array[ApiResponse]] = "fetchAll"

extern "js" fn ApiClient::new(base_url : String) -> ApiClient =
  #| (base_url) => new ApiClient(base_url)

extern "js" fn ApiClient::get(self : ApiClient, path : String) -> @js.Promise[ApiResponse] =
  #| (self, path) => self.get(path)

extern "js" fn ApiClient::post(self : ApiClient, path : String, body : String) -> @js.Promise[ApiResponse] =
  #| (self, path, body) => self.post(path, body)
