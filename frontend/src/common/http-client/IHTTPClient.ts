export interface IHTTPClient {
  get(url: string, options?: RequestInit): Promise<any>;
  post(url: string, body: object, options?: RequestInit): Promise<any>;
}
