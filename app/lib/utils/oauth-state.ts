// Simple OAuth state tracking to prevent race conditions
class OAuthStateManager {
  private static instance: OAuthStateManager;
  private isProcessedByDeepLink = false;
  private processingStartTime: number | null = null;

  static getInstance(): OAuthStateManager {
    if (!OAuthStateManager.instance) {
      OAuthStateManager.instance = new OAuthStateManager();
    }
    return OAuthStateManager.instance;
  }

  startProcessing(): void {
    this.processingStartTime = Date.now();
    this.isProcessedByDeepLink = false;
  }

  markProcessedByDeepLink(): void {
    this.isProcessedByDeepLink = true;
  }

  isProcessed(): boolean {
    return this.isProcessedByDeepLink;
  }

  isProcessingTimeout(): boolean {
    if (!this.processingStartTime) return false;
    // Consider timeout after 15 seconds
    return Date.now() - this.processingStartTime > 15000;
  }

  reset(): void {
    this.isProcessedByDeepLink = false;
    this.processingStartTime = null;
  }
}

export const oauthStateManager = OAuthStateManager.getInstance();
