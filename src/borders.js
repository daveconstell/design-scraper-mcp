import browserManager from './browserManager.js';

class BorderAnalyzer {
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

  // Parse border radius values and normalize them
  parseBorderRadius(borderRadius) {
    if (!borderRadius || borderRadius === '0px' || borderRadius === 'none') {
      return null;
    }

    // Handle complex border-radius values (e.g., "10px 5px 10px 5px")
    const values = borderRadius.split(' ').map(v => v.trim());

    // If all values are the same, return just one
    if (values.every(v => v === values[0])) {
      return values[0];
    }

    return borderRadius;
  }

  // Parse border width values
  parseBorderWidth(borderWidth) {
    if (!borderWidth || borderWidth === '0px' || borderWidth === 'none') {
      return null;
    }

    return borderWidth;
  }

  // Parse border color values
  parseBorderColor(borderColor) {
    if (
      !borderColor ||
      borderColor === 'rgba(0, 0, 0, 0)' ||
      borderColor === 'transparent'
    ) {
      return null;
    }

    return borderColor;
  }

  // Convert RGB to hex for consistency
  rgbToHex(rgb) {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return rgb;
  }

  // Extract border properties from all elements
  async extractBorders(url) {
    await this.page.goto(url, { waitUntil: 'networkidle2' });

    const borderData = await this.page.evaluate(() => {
      const borderUsage = {
        borderRadius: new Map(),
        borderWidth: new Map(),
        borderColor: new Map(),
      };

      const elements = document.querySelectorAll('*');

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);

        // Get border radius
        const borderRadius = styles.borderRadius;
        if (borderRadius && borderRadius !== '0px') {
          const count = borderUsage.borderRadius.get(borderRadius) || 0;
          borderUsage.borderRadius.set(borderRadius, count + 1);
        }

        // Get border width (check all sides)
        const borderWidths = [
          styles.borderTopWidth,
          styles.borderRightWidth,
          styles.borderBottomWidth,
          styles.borderLeftWidth,
        ];

        borderWidths.forEach(width => {
          if (width && width !== '0px') {
            const count = borderUsage.borderWidth.get(width) || 0;
            borderUsage.borderWidth.set(width, count + 1);
          }
        });

        // Get border color (check all sides)
        const borderColors = [
          styles.borderTopColor,
          styles.borderRightColor,
          styles.borderBottomColor,
          styles.borderLeftColor,
        ];

        borderColors.forEach(color => {
          if (
            color &&
            color !== 'rgba(0, 0, 0, 0)' &&
            color !== 'transparent'
          ) {
            const count = borderUsage.borderColor.get(color) || 0;
            borderUsage.borderColor.set(color, count + 1);
          }
        });

        // Also check shorthand border property
        const border = styles.border;
        if (
          border &&
          border !== 'none' &&
          border !== '0px none rgba(0, 0, 0, 0)'
        ) {
          // Try to extract width and color from shorthand
          const borderMatch = border.match(/(\d+px)\s+\w+\s+(.*)/);
          if (borderMatch) {
            const [, width, color] = borderMatch;

            if (width) {
              const count = borderUsage.borderWidth.get(width) || 0;
              borderUsage.borderWidth.set(width, count + 1);
            }

            if (color && color !== 'rgba(0, 0, 0, 0)') {
              const count = borderUsage.borderColor.get(color) || 0;
              borderUsage.borderColor.set(color, count + 1);
            }
          }
        }
      });

      // Convert Maps to arrays and sort by usage
      return {
        borderRadius: Array.from(borderUsage.borderRadius.entries()).sort(
          (a, b) => b[1] - a[1]
        ),
        borderWidth: Array.from(borderUsage.borderWidth.entries()).sort(
          (a, b) => b[1] - a[1]
        ),
        borderColor: Array.from(borderUsage.borderColor.entries()).sort(
          (a, b) => b[1] - a[1]
        ),
      };
    });

    return borderData;
  }

  // Get the most common border properties
  async analyzeBorders(url) {
    try {
      await this.init();

      const borderData = await this.extractBorders(url);

      // Get most common values
      const mostCommonBorderRadius =
        borderData.borderRadius.length > 0
          ? this.parseBorderRadius(borderData.borderRadius[0][0])
          : null;

      const mostCommonBorderWidth =
        borderData.borderWidth.length > 0
          ? this.parseBorderWidth(borderData.borderWidth[0][0])
          : null;

      const mostCommonBorderColor =
        borderData.borderColor.length > 0
          ? this.rgbToHex(borderData.borderColor[0][0])
          : null;

      await this.close();

      return {
        borderRadius: mostCommonBorderRadius || '0px',
        borderWidth: mostCommonBorderWidth || '0px',
        borderColor: mostCommonBorderColor || 'transparent',
        details: {
          borderRadiusUsage: borderData.borderRadius.slice(0, 5),
          borderWidthUsage: borderData.borderWidth.slice(0, 5),
          borderColorUsage: borderData.borderColor.slice(0, 5),
        },
      };
    } catch (error) {
      await this.close();
      throw error;
    }
  }

  // Display border analysis results
  displayBorderAnalysis(analysis) {
    return analysis;
  }
}

// Main function to analyze borders on a website
async function analyzeBorders(url) {
  const analyzer = new BorderAnalyzer();

  try {
    const analysis = await analyzer.analyzeBorders(url);
    return analysis;
  } catch (error) {
    throw error;
  }
}

// Convenience function to get just the most common border properties as strings
async function getBorderProperties(url) {
  const analyzer = new BorderAnalyzer();

  try {
    const analysis = await analyzer.analyzeBorders(url);

    const result = {
      borderRadius: analysis.borderRadius,
      borderWidth: analysis.borderWidth,
      borderColor: analysis.borderColor,
    };

    return result;
  } catch (error) {
    throw error;
  }
}

// Export for use
export { BorderAnalyzer, analyzeBorders, getBorderProperties };
