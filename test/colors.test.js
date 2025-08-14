import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ColorExtractor } from '../src/colors.js';

describe('ColorExtractor', () => {
  let colorExtractor;

  beforeEach(() => {
    colorExtractor = new ColorExtractor();
  });

  afterEach(async () => {
    await colorExtractor.close();
  });

  describe('hexToRgb', () => {
    it('should convert hex color to RGB object', () => {
      const result = colorExtractor.hexToRgb('#ff0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle hex without # prefix', () => {
      const result = colorExtractor.hexToRgb('00ff00');
      expect(result).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should return null for invalid hex', () => {
      const result = colorExtractor.hexToRgb('invalid');
      expect(result).toBeNull();
    });

    it('should handle lowercase hex', () => {
      const result = colorExtractor.hexToRgb('#abc123');
      expect(result).toEqual({ r: 171, g: 193, b: 35 });
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB values to hex string', () => {
      const result = colorExtractor.rgbToHex(255, 0, 0);
      expect(result).toBe('#ff0000');
    });

    it('should handle zero values', () => {
      const result = colorExtractor.rgbToHex(0, 0, 0);
      expect(result).toBe('#000000');
    });

    it('should handle max values', () => {
      const result = colorExtractor.rgbToHex(255, 255, 255);
      expect(result).toBe('#ffffff');
    });
  });

  describe('parseColor', () => {
    it('should parse hex colors', () => {
      const result = colorExtractor.parseColor('#ff0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse rgb colors', () => {
      const result = colorExtractor.parseColor('rgb(255, 0, 0)');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse rgba colors', () => {
      const result = colorExtractor.parseColor('rgba(255, 0, 0, 0.5)');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should return null for transparent colors', () => {
      expect(colorExtractor.parseColor('transparent')).toBeNull();
      expect(colorExtractor.parseColor('rgba(0, 0, 0, 0)')).toBeNull();
      expect(colorExtractor.parseColor('')).toBeNull();
      expect(colorExtractor.parseColor(null)).toBeNull();
    });

    it('should return null for invalid colors', () => {
      const result = colorExtractor.parseColor('invalid-color');
      expect(result).toBeNull();
    });
  });

  describe('colorToHex', () => {
    it('should convert hex colors to lowercase', () => {
      const result = colorExtractor.colorToHex('#FF0000');
      expect(result).toBe('#ff0000');
    });

    it('should convert rgb to hex', () => {
      const result = colorExtractor.colorToHex('rgb(255, 0, 0)');
      expect(result).toBe('#ff0000');
    });

    it('should convert rgba to hex', () => {
      const result = colorExtractor.colorToHex('rgba(0, 255, 0, 0.8)');
      expect(result).toBe('#00ff00');
    });

    it('should return empty string for transparent colors', () => {
      expect(colorExtractor.colorToHex('transparent')).toBe('');
      expect(colorExtractor.colorToHex('rgba(0, 0, 0, 0)')).toBe('');
      expect(colorExtractor.colorToHex('')).toBe('');
    });

    it('should return empty string for invalid colors', () => {
      const result = colorExtractor.colorToHex('invalid-color');
      expect(result).toBe('');
    });
  });
});
