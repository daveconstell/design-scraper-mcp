import puppeteer from 'puppeteer';

class BrowserManager {
  constructor() {
    this.browser = null;
    this.isInitialized = false;
  }

  async init() {
    if (!this.isInitialized) {
      this.browser = await puppeteer.launch({ headless: 'new' });
      this.isInitialized = true;
    }
    return this.browser;
  }

  async newPage() {
    if (!this.isInitialized) {
      await this.init();
    }
    return await this.browser.newPage();
  }

  async close() {
    if (this.browser && this.isInitialized) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
    }
  }

  isReady() {
    return this.isInitialized && this.browser;
  }
}

// Export a singleton instance
const browserManager = new BrowserManager();
export default browserManager;
