import browserManager from './browserManager.js';

class Extractor {
  constructor() {
    this.extractors = new Map();
    this.browserManager = browserManager;
  }

  /**
   * Add an extraction function to the pipeline
   * @param {string} name - Name of the extractor
   * @param {Function} extractorFn - Function that takes (page, url) and returns extracted data
   */
  add(name, extractorFn) {
    if (typeof extractorFn !== 'function') {
      throw new Error(`Extractor for '${name}' must be a function`);
    }
    this.extractors.set(name, extractorFn);
    return this; // Allow chaining
  }

  /**
   * Extract all data from the given URL using all registered extractors
   * @param {string} url - URL to extract data from
   * @returns {Object} Object with results from all extractors
   */
  async extract(url) {
    if (!url) {
      throw new Error('URL is required for extraction');
    }

    if (this.extractors.size === 0) {
      return {};
    }

    const results = {};
    let page = null;

    try {
      await this.browserManager.init();

      page = await this.browserManager.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Run all extractors sequentially
      for (const [name, extractorFn] of this.extractors) {
        try {
          results[name] = await extractorFn(page, url);
        } catch (error) {
          results[name] = null; // Set to null to indicate failure
        }
      }
    } catch (error) {
      throw error;
    } finally {
      // Clean up page
      if (page) {
        await page.close();
      }
      // Clean up browser
      await this.browserManager.close();
    }

    return results;
  }

  /**
   * Get list of registered extractor names
   * @returns {string[]} Array of extractor names
   */
  getExtractorNames() {
    return Array.from(this.extractors.keys());
  }

  /**
   * Remove an extractor from the pipeline
   * @param {string} name - Name of the extractor to remove
   * @returns {boolean} True if extractor was removed, false if not found
   */
  remove(name) {
    return this.extractors.delete(name);
  }

  /**
   * Clear all extractors
   */
  clear() {
    this.extractors.clear();
  }

  /**
   * Get the number of registered extractors
   * @returns {number} Number of extractors
   */
  size() {
    return this.extractors.size;
  }
}

export default Extractor;
