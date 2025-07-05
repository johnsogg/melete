import { createCanvas, DrawingSurface } from '../../lib';
import { getTextDimensions } from '../../lib/graphics';

interface TextMetrics {
  text: string;
  font: string;
  characterCount: number;
  lineCount: number;
  width: number;
  height: number;
  baseline: number;
  ascent: number;
  descent: number;
  isEmpty: boolean;
  hasEmoji: boolean;
  hasSpecialChars: boolean;
}

interface DemoModel {
  text: string;
  font: string;
  metrics: TextMetrics;
}

interface DemoLayerSchema {
  main: { cache: false; offscreen: false };
  [key: string]: { cache: boolean; offscreen: boolean };
}

class TextMeasurementDemo {
  private surface!: DrawingSurface<DemoModel, DemoLayerSchema>;
  private textInput: HTMLTextAreaElement;
  private fontSelect: HTMLSelectElement;
  private metricsContent: HTMLElement;

  constructor() {
    this.textInput = document.getElementById(
      'textInput'
    ) as HTMLTextAreaElement;
    this.fontSelect = document.getElementById(
      'fontSelect'
    ) as HTMLSelectElement;
    this.metricsContent = document.getElementById(
      'metricsContent'
    ) as HTMLElement;

    this.initializeSurface();
    this.setupEventListeners();
    this.updateDisplay();
  }

  private initializeSurface(): void {
    const initialText = this.textInput.value;
    const initialFont = this.fontSelect.value;
    const initialMetrics = this.calculateMetrics(initialText, initialFont);

    this.surface = new DrawingSurface({
      model: {
        text: initialText,
        font: initialFont,
        metrics: initialMetrics,
      },
      layerSchema: {
        main: { cache: false, offscreen: false },
      },
      canvasOptions: {
        width: 800,
        height: 600,
      },
      container: document.getElementById('canvas-container') || undefined,
    });

    const mainLayer = this.surface.getLayer('main');

    mainLayer.onDemand(({ model, layer }) => {
      layer.clear('#ffffff');

      const { text, font, metrics } = model;

      // Draw background grid for reference
      this.drawGrid(layer);

      // Draw text with measurements
      this.drawTextWithMeasurements(layer, text, font, metrics);
    });
  }

  private setupEventListeners(): void {
    this.textInput.addEventListener('input', () => this.updateDisplay());
    this.fontSelect.addEventListener('change', () => this.updateDisplay());
  }

  private updateDisplay(): void {
    const text = this.textInput.value;
    const font = this.fontSelect.value;
    const metrics = this.calculateMetrics(text, font);

    // Update the surface model
    this.surface.setModel({ text, font, metrics });

    // Update metrics display
    this.updateMetricsDisplay(metrics);

    // Render the canvas
    this.surface.render();
  }

  private calculateMetrics(text: string, font: string): TextMetrics {
    const canvas = createCanvas(document.createElement('canvas'), {
      width: 100,
      height: 100,
    });
    const ctx = canvas.getContext();

    // Handle empty text
    if (text === '') {
      return {
        text,
        font,
        characterCount: 0,
        lineCount: 0,
        width: 0,
        height: 0,
        baseline: 0,
        ascent: 0,
        descent: 0,
        isEmpty: true,
        hasEmoji: false,
        hasSpecialChars: false,
      };
    }

    const lines = text.split('\n');
    const lineCount = lines.length;
    const characterCount = text.length;

    // Check for emoji and special characters
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    const specialCharRegex = /[^\u0020-\u007E]/;
    const hasEmoji = emojiRegex.test(text);
    const hasSpecialChars = specialCharRegex.test(text);

    // Measure each line and get overall dimensions
    let maxWidth = 0;
    let totalHeight = 0;
    let maxAscent = 0;
    let maxDescent = 0;

    for (const line of lines) {
      if (line.trim() === '') {
        // Measure a space to get line height for empty lines
        const dimensions = getTextDimensions(ctx, ' ', font);
        totalHeight += dimensions.height;
        maxAscent = Math.max(maxAscent, dimensions.ascent);
        maxDescent = Math.max(maxDescent, dimensions.descent);
      } else {
        const dimensions = getTextDimensions(ctx, line, font);
        maxWidth = Math.max(maxWidth, dimensions.width);
        totalHeight += dimensions.height;
        maxAscent = Math.max(maxAscent, dimensions.ascent);
        maxDescent = Math.max(maxDescent, dimensions.descent);
      }
    }

    // Add line spacing for multi-line text
    if (lineCount > 1) {
      totalHeight += (lineCount - 1) * 4; // 4px line spacing
    }

    return {
      text,
      font,
      characterCount,
      lineCount,
      width: maxWidth,
      height: totalHeight,
      baseline: maxAscent,
      ascent: maxAscent,
      descent: maxDescent,
      isEmpty: false,
      hasEmoji,
      hasSpecialChars,
    };
  }

  private updateMetricsDisplay(metrics: TextMetrics): void {
    const formatNumber = (num: number) => num.toFixed(2);

    this.metricsContent.innerHTML = `
      <div class="metric-row">
        <span class="metric-label">Text:</span>
        <span class="metric-value">${metrics.isEmpty ? '(empty)' : `"${metrics.text.substring(0, 30)}${metrics.text.length > 30 ? '...' : ''}"`}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Font:</span>
        <span class="metric-value">${metrics.font}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Character Count:</span>
        <span class="metric-value">${metrics.characterCount}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Line Count:</span>
        <span class="metric-value">${metrics.lineCount}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Width (pixels):</span>
        <span class="metric-value">${formatNumber(metrics.width)}px</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Height (pixels):</span>
        <span class="metric-value">${formatNumber(metrics.height)}px</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Baseline:</span>
        <span class="metric-value">${formatNumber(metrics.baseline)}px</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Ascent:</span>
        <span class="metric-value">${formatNumber(metrics.ascent)}px</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Descent:</span>
        <span class="metric-value">${formatNumber(metrics.descent)}px</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Contains Emoji:</span>
        <span class="metric-value">${metrics.hasEmoji ? '✅ Yes' : '❌ No'}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Contains Special Chars:</span>
        <span class="metric-value">${metrics.hasSpecialChars ? '✅ Yes' : '❌ No'}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Is Empty:</span>
        <span class="metric-value">${metrics.isEmpty ? '✅ Yes' : '❌ No'}</span>
      </div>
    `;
  }

  private drawGrid(layer: import('../../lib/layer').DrawingLayer): void {
    const gridSize = 50;
    const width = 800;
    const height = 600;

    // Draw grid lines
    for (let x = 0; x <= width; x += gridSize) {
      layer.drawLine({
        from: { x, y: 0 },
        to: { x, y: height },
        stroke: true,
        strokeColor: '#f0f0f0',
        strokeThickness: 1,
      });
    }

    for (let y = 0; y <= height; y += gridSize) {
      layer.drawLine({
        from: { x: 0, y },
        to: { x: width, y },
        stroke: true,
        strokeColor: '#f0f0f0',
        strokeThickness: 1,
      });
    }
  }

  private drawTextWithMeasurements(
    layer: import('../../lib/layer').DrawingLayer,
    text: string,
    font: string,
    metrics: TextMetrics
  ): void {
    if (metrics.isEmpty) {
      // Show a placeholder for empty text
      layer.drawText({
        text: '(empty text)',
        position: { x: 50, y: 100 },
        font: '16px Arial',
        textColor: '#999',
      });
      return;
    }

    const startX = 50;
    const startY = 100;
    const lines = text.split('\n');

    // Draw bounding box
    layer.drawRect({
      topLeft: { x: startX - 5, y: startY - metrics.ascent - 5 },
      size: { width: metrics.width + 10, height: metrics.height + 10 },
      stroke: true,
      strokeColor: '#007bff',
      strokeThickness: 2,
      fill: false,
    });

    // Draw baseline line
    layer.drawLine({
      from: { x: startX - 10, y: startY },
      to: { x: startX + metrics.width + 10, y: startY },
      stroke: true,
      strokeColor: '#28a745',
      strokeThickness: 1,
    });

    // Draw ascent line
    layer.drawLine({
      from: { x: startX - 10, y: startY - metrics.ascent },
      to: { x: startX + metrics.width + 10, y: startY - metrics.ascent },
      stroke: true,
      strokeColor: '#ffc107',
      strokeThickness: 1,
    });

    // Draw descent line
    layer.drawLine({
      from: { x: startX - 10, y: startY + metrics.descent },
      to: { x: startX + metrics.width + 10, y: startY + metrics.descent },
      stroke: true,
      strokeColor: '#dc3545',
      strokeThickness: 1,
    });

    // Draw the actual text
    let currentY = startY;
    for (const line of lines) {
      layer.drawText({
        text: line,
        position: { x: startX, y: currentY },
        font,
        textColor: '#000',
      });
      currentY += metrics.height / metrics.lineCount;
    }

    // Draw labels for measurement lines
    layer.drawText({
      text: 'Baseline',
      position: { x: startX + metrics.width + 20, y: startY + 5 },
      font: '12px Arial',
      textColor: '#28a745',
    });

    layer.drawText({
      text: 'Ascent',
      position: {
        x: startX + metrics.width + 20,
        y: startY - metrics.ascent + 5,
      },
      font: '12px Arial',
      textColor: '#ffc107',
    });

    layer.drawText({
      text: 'Descent',
      position: {
        x: startX + metrics.width + 20,
        y: startY + metrics.descent + 5,
      },
      font: '12px Arial',
      textColor: '#dc3545',
    });

    // Draw dimensions
    layer.drawText({
      text: `${metrics.width.toFixed(1)}px`,
      position: {
        x: startX + metrics.width / 2 - 20,
        y: startY + metrics.height + 30,
      },
      font: '12px Arial',
      textColor: '#007bff',
    });

    layer.drawText({
      text: `${metrics.height.toFixed(1)}px`,
      position: { x: startX - 40, y: startY - metrics.height / 2 },
      font: '12px Arial',
      textColor: '#007bff',
    });
  }
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new TextMeasurementDemo();
});
