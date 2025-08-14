// Screenshot extractor function for the pipeline system
export async function screenshotExtractor(page, url) {
  try {
    // Take a single full page screenshot
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: 'png'
    });

    // Convert to base64
    const base64Screenshot = screenshotBuffer.toString('base64');

    // Get page dimensions
    const pageInfo = await page.evaluate(() => {
      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        document: {
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight
        }
      };
    });

    return {
      screenshot: base64Screenshot,
      size: screenshotBuffer.length,
      dimensions: {
        width: pageInfo.document.width,
        height: pageInfo.document.height
      },
      url
    };
  } catch (error) {
    throw error;
  }
}

// Simplified screenshot function
import browserManager from './browserManager.js';

export default async function screenshots(url, options = {}) {
  if (!url) {
    return {
      screenshot: null,
      size: null,
      dimensions: null,
      url: null
    };
  }

  const page = await browserManager.newPage();
  
  try {
    // Set viewport if specified
    if (options.viewportWidth && options.viewportHeight) {
      await page.setViewport({
        width: options.viewportWidth,
        height: options.viewportHeight
      });
    }

    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Take a single full page screenshot
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: 'png'
    });

    // Convert to base64
    const base64Screenshot = screenshotBuffer.toString('base64');

    // Get page dimensions
    const pageInfo = await page.evaluate(() => {
      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        document: {
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight
        }
      };
    });

    return {
      screenshot: base64Screenshot,
      size: screenshotBuffer.length,
      dimensions: {
        width: pageInfo.document.width,
        height: pageInfo.document.height
      },
      url
    };
  } catch (error) {
    throw error;
  } finally {
    await page.close();
  }
}
