import browserManager from './browserManager.js';

class ColorExtractor {
  constructor() {
    this.page = null;
  }

  async init() {
    this.page = await browserManager.newPage();
  }

  async close() {
    if (this.page) {
      await this.page.close();
    }
  }

  // Convert hex to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  // Convert RGB to hex
  rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Parse color string to RGB object
  parseColor(colorStr) {
    if (
      !colorStr ||
      colorStr === 'transparent' ||
      colorStr === 'rgba(0, 0, 0, 0)'
    ) {
      return null;
    }

    // Handle hex colors
    if (colorStr.startsWith('#')) {
      return this.hexToRgb(colorStr);
    }

    // Handle rgb/rgba colors
    const rgbMatch = colorStr.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
    );
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3]),
      };
    }

    return null;
  }

  // Convert any color string to hex format
  colorToHex(colorStr) {
    if (
      !colorStr ||
      colorStr === 'transparent' ||
      colorStr === 'rgba(0, 0, 0, 0)'
    ) {
      return '';
    }

    // Already hex format
    if (colorStr.startsWith('#')) {
      return colorStr.toLowerCase();
    }

    // Parse and convert to hex
    const rgb = this.parseColor(colorStr);
    if (rgb) {
      return this.rgbToHex(rgb.r, rgb.g, rgb.b).toLowerCase();
    }

    return '';
  }

  // Extract colors from website
  async extractColors(url) {
    await this.page.goto(url, { waitUntil: 'networkidle2' });

    const extractedData = await this.page.evaluate(() => {
      const backgrounds = new Set();
      const foregrounds = new Set();
      const elements = {
        button: [],
        header: { background: '', foreground: '' },
        body: { background: '', foreground: '' },
        footer: { background: '', foreground: '' },
      };

      // Helper function to normalize color
      const normalizeColor = color => {
        if (!color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
          return '';
        }
        return color;
      };

      // Extract body colors
      const body = document.body;
      if (body) {
        const bodyStyles = window.getComputedStyle(body);
        const bodyBg = normalizeColor(bodyStyles.backgroundColor);
        const bodyFg = normalizeColor(bodyStyles.color);

        if (bodyBg) {
          backgrounds.add(bodyBg);
          elements.body.background = bodyBg;
        }
        if (bodyFg) {
          foregrounds.add(bodyFg);
          elements.body.foreground = bodyFg;
        }
      }

      // Extract header colors (header, nav, or first significant header element)
      const headerEl =
        document.querySelector('header') ||
        document.querySelector('nav') ||
        document.querySelector('.header') ||
        document.querySelector('#header');
      if (headerEl) {
        const headerStyles = window.getComputedStyle(headerEl);
        const headerBg = normalizeColor(headerStyles.backgroundColor);
        const headerFg = normalizeColor(headerStyles.color);

        if (headerBg) {
          backgrounds.add(headerBg);
          elements.header.background = headerBg;
        }
        if (headerFg) {
          foregrounds.add(headerFg);
          elements.header.foreground = headerFg;
        }
      }

      // Extract footer colors
      const footerEl =
        document.querySelector('footer') ||
        document.querySelector('.footer') ||
        document.querySelector('#footer');
      if (footerEl) {
        const footerStyles = window.getComputedStyle(footerEl);
        const footerBg = normalizeColor(footerStyles.backgroundColor);
        const footerFg = normalizeColor(footerStyles.color);

        if (footerBg) {
          backgrounds.add(footerBg);
          elements.footer.background = footerBg;
        }
        if (footerFg) {
          foregrounds.add(footerFg);
          elements.footer.foreground = footerFg;
        }
      }

      // Extract button colors with scoring system
      const buttons = document.querySelectorAll(
        `
        button,
        .button,
        .btn,
        input[type="button"],
        input[type="submit"],
        input[type="reset"],
        [role="button"],
        a.button,
        a.btn,
        a[class*="button"],
        a[class*="btn"],
        div.button,
        div.btn,
        div[class*="button"],
        div[class*="btn"],
        span.button,
        span.btn,
        span[class*="button"],
        span[class*="btn"],
        .cta,
        .call-to-action,
        .action-button,
        .primary-button,
        .secondary-button,
        .submit-button,
        .form-button
      `
          .replace(/\s+/g, ' ')
          .trim()
      );
      const buttonColorMap = new Map();

      buttons.forEach(button => {
        const buttonStyles = window.getComputedStyle(button);
        const buttonBg = normalizeColor(buttonStyles.backgroundColor);
        const buttonFg = normalizeColor(buttonStyles.color);

        // Filter out combinations that don't make sense
        const isValidCombination = (bg, fg) => {
          // Must have at least one color (background or foreground)
          if (!bg && !fg) return false;

          // If both colors exist, they shouldn't be the same (invisible text)
          if (bg && fg && bg === fg) return false;

          // If only foreground exists, it should not be white/transparent (likely inherited)
          if (
            !bg &&
            fg &&
            (fg === 'rgb(255, 255, 255)' || fg === 'rgba(255, 255, 255, 1)')
          )
            return false;

          // Remove buttons with white background
          if (
            bg &&
            (bg === 'rgb(255, 255, 255)' ||
              bg === 'rgba(255, 255, 255, 1)' ||
              bg === '#ffffff')
          )
            return false;

          // Remove buttons with black background and black foreground
          if (
            bg &&
            fg &&
            (bg === 'rgb(0, 0, 0)' ||
              bg === 'rgba(0, 0, 0, 1)' ||
              bg === '#000000') &&
            (fg === 'rgb(0, 0, 0)' ||
              fg === 'rgba(0, 0, 0, 1)' ||
              fg === '#000000')
          )
            return false;

          return true;
        };

        if (isValidCombination(buttonBg, buttonFg)) {
          // Create a unique key for this color combination
          const colorKey = `${buttonBg || 'none'}|${buttonFg || 'none'}`;

          if (buttonColorMap.has(colorKey)) {
            // Increment score for existing color combination
            const existing = buttonColorMap.get(colorKey);
            existing.score += 1;
          } else {
            // Add new color combination with initial score
            buttonColorMap.set(colorKey, {
              background: buttonBg || '',
              foreground: buttonFg || '',
              score: 1,
            });
          }

          if (buttonBg) backgrounds.add(buttonBg);
          if (buttonFg) foregrounds.add(buttonFg);
        }
      });

      // Convert map to array and sort by score (descending), then take top 3
      const sortedButtons = Array.from(buttonColorMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(button => ({
          background: button.background,
          foreground: button.foreground,
          score: button.score,
        }));

      // If no buttons found, add empty entry
      if (sortedButtons.length === 0) {
        elements.button = [{ background: '', foreground: '', score: 0 }];
      } else {
        elements.button = sortedButtons;
      }

      return {
        backgrounds: Array.from(backgrounds),
        foregrounds: Array.from(foregrounds),
        elements,
      };
    });

    // Convert all colors to hex format and ensure uniqueness
    const convertedData = {
      backgrounds: [
        ...new Set(
          extractedData.backgrounds
            .map(color => this.colorToHex(color))
            .filter(color => color)
        ),
      ],
      foregrounds: [
        ...new Set(
          extractedData.foregrounds
            .map(color => this.colorToHex(color))
            .filter(color => color)
        ),
      ],
      elements: {},
    };

    // Convert element colors to hex
    Object.keys(extractedData.elements).forEach(elementType => {
      if (elementType === 'button') {
        convertedData.elements.button = extractedData.elements.button.map(
          button => ({
            background: this.colorToHex(button.background),
            foreground: this.colorToHex(button.foreground),
            score: button.score,
          })
        );
      } else {
        convertedData.elements[elementType] = {
          background: this.colorToHex(
            extractedData.elements[elementType].background
          ),
          foreground: this.colorToHex(
            extractedData.elements[elementType].foreground
          ),
        };
      }
    });

    return convertedData;
  }

  // Main function to get colors from website
  async getColors(url) {
    try {
      await this.init();
      const colors = await this.extractColors(url);
      await this.close();
      return colors;
    } catch (error) {
      await this.close();
      throw error;
    }
  }
}

// Export function that returns colors from a website
export default async function colors(url) {
  if (!url) {
    // Return empty structure if no URL provided
    return {
      backgrounds: [],
      foregrounds: [],
      elements: {
        button: [{ background: '', foreground: '', score: 0 }],
        header: { background: '', foreground: '' },
        body: { background: '', foreground: '' },
        footer: { background: '', foreground: '' },
      },
    };
  }

  const extractor = new ColorExtractor();
  return await extractor.getColors(url);
}

// Compatibility function for existing code
export async function analyzeSite(url) {
  const extractor = new ColorExtractor();
  return await extractor.getColors(url);
}

// Also export the class for advanced usage
export { ColorExtractor };
