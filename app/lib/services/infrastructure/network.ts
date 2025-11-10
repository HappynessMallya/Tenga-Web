export type NetworkStatus = {
  isOnline: boolean;
  lastCheckedAt: number;
};

class NetworkService {
  private status: NetworkStatus = { isOnline: true, lastCheckedAt: Date.now() };

  async check(): Promise<NetworkStatus> {
    this.status = { isOnline: true, lastCheckedAt: Date.now() };
    return this.status;
  }

  getStatus(): NetworkStatus {
    return this.status;
  }

  async fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    // Placeholder wrapper for future API integration
    const res = await fetch(url, init);
    return (await res.json()) as T;
  }
}

export const networkService = new NetworkService();
export default networkService;
