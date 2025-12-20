// 非同期関数
export interface ApiResponse {
  data: string;
  status: number;
}

export function fetchData(url: string): Promise<ApiResponse>;
export function fetchAll(urls: string[]): Promise<ApiResponse[]>;

export class ApiClient {
  constructor(baseUrl: string);
  get(path: string): Promise<ApiResponse>;
  post(path: string, body: string): Promise<ApiResponse>;
}
