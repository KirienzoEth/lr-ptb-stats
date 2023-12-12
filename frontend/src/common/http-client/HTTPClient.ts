import { IHTTPClient } from './IHTTPClient';

export class HTTPClient implements IHTTPClient {
  async get(url: string, options?: RequestInit): Promise<any> {
    const response = await fetch(url, {
      ...options,
      method: 'GET',
    });

    return response.json();
  }

  async post(url: string, body: object, options?: RequestInit): Promise<any> {
    const response = await fetch(url, {
      ...options,
      body: JSON.stringify(body),
      method: 'POST',
    });

    return response.json();
  }
}
