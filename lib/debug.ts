import { DrawingSurface, MeleteMouseEvent } from './surface';
import { LayerSchema } from './types';

interface DebugEvent {
  type: string;
  timestamp: number;
  data: any;
}

interface PerformanceData {
  lastRenderTime: number;
  averageRenderTime: number;
  renderCount: number;
  fps: number;
}

export interface DebugPanelOptions {
  maxEventHistory?: number;
  updateInterval?: number;
  expandedByDefault?: boolean;
}

export class DebugPanel<T = any, S extends LayerSchema = LayerSchema> {
  private surface: DrawingSurface<T, S>;
  private container: HTMLElement;
  private eventHistory: DebugEvent[] = [];
  private performanceData: PerformanceData = {
    lastRenderTime: 0,
    averageRenderTime: 0,
    renderCount: 0,
    fps: 0,
  };
  private maxEventHistory: number;
  private updateInterval: number;
  private lastFpsUpdate = Date.now();
  private frameCount = 0;
  private expanded: boolean;

  // DOM elements
  private panelElement!: HTMLElement;
  private modelStateElement!: HTMLElement;
  private eventHistoryElement!: HTMLElement;
  private performanceElement!: HTMLElement;
  private canvasInfoElement!: HTMLElement;
  private layerControlsElement!: HTMLElement;
  private toggleButton!: HTMLElement;

  constructor(
    surface: DrawingSurface<T, S>,
    container: HTMLElement,
    options: DebugPanelOptions = {}
  ) {
    this.surface = surface;
    this.container = container;
    this.maxEventHistory = options.maxEventHistory || 10;
    this.updateInterval = options.updateInterval || 500;
    this.expanded = options.expandedByDefault === true;

    this.createUI();
    this.attachEventHandlers();
    this.startPerformanceMonitoring();
  }

  private createUI(): void {
    // Create main panel
    this.panelElement = document.createElement('div');
    this.panelElement.className = `melete-debug-panel${this.expanded ? ' expanded' : ''}`;
    this.panelElement.innerHTML = `
      <div class="debug-header" style="display: ${this.expanded ? 'flex' : 'none'}">
        <h3><span class="debug-bug-emoji">🐛</span> Debug Panel</h3>
        <button class="debug-toggle">−</button>
      </div>
      <button class="debug-toggle-collapsed" style="display: ${this.expanded ? 'none' : 'block'}">🐛</button>
      <div class="debug-content" style="display: ${this.expanded ? 'block' : 'none'}">
        <div class="debug-section">
          <h4>📊 Model State</h4>
          <pre class="debug-model-state">Loading...</pre>
        </div>
        
        <div class="debug-section">
          <h4>🎯 Recent Events</h4>
          <div class="debug-event-history">No events yet</div>
        </div>
        
        <div class="debug-section">
          <h4>⚡ Performance</h4>
          <div class="debug-performance">
            <div>FPS: <span class="debug-fps">--</span></div>
            <div>Last Render: <span class="debug-render-time">--</span>ms</div>
            <div>Avg Render: <span class="debug-avg-render">--</span>ms</div>
            <div>Total Renders: <span class="debug-render-count">0</span></div>
          </div>
        </div>
        
        <div class="debug-section">
          <h4>🖼️ Canvas Info</h4>
          <div class="debug-canvas-info">
            <div>Dimensions: <span class="debug-canvas-size">--</span></div>
            <div>Layers: <span class="debug-layer-count">--</span></div>
          </div>
        </div>
        
        <div class="debug-section">
          <h4>👁️ Layer Controls</h4>
          <div class="debug-layer-controls">
            Loading layer controls...
          </div>
        </div>
      </div>
    `;

    // Add CSS
    this.addStyles();

    // Get references to elements
    this.modelStateElement =
      this.panelElement.querySelector('.debug-model-state')!;
    this.eventHistoryElement = this.panelElement.querySelector(
      '.debug-event-history'
    )!;
    this.performanceElement =
      this.panelElement.querySelector('.debug-performance')!;
    this.canvasInfoElement =
      this.panelElement.querySelector('.debug-canvas-info')!;
    this.layerControlsElement = this.panelElement.querySelector(
      '.debug-layer-controls'
    )!;
    this.toggleButton = this.panelElement.querySelector('.debug-toggle')!;

    // Append to container
    this.container.appendChild(this.panelElement);

    // Initial updates
    this.updateModelState();
    this.updateCanvasInfo();
    this.updateLayerControls();
  }

  private addStyles(): void {
    const styleId = 'melete-debug-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .melete-debug-panel {
        margin-top: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        width: fit-content;
      }
      
      .melete-debug-panel.expanded {
        padding: 15px;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        width: auto;
      }
      
      .debug-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 2px solid #e9ecef;
        padding-bottom: 10px;
      }
      
      .debug-header h3 {
        margin: 0;
        color: #495057;
        font-size: 16px;
      }
      
      .debug-toggle {
        background: #007bff;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
        min-width: 28px;
      }
      
      .debug-toggle:hover {
        background: #0056b3;
      }
      
      .debug-toggle-collapsed {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        margin: 0;
        width: auto;
        height: auto;
        display: inline-block;
      }
      
      .debug-toggle-collapsed:hover {
        opacity: 0.7;
      }
      
      .debug-bug-emoji {
        cursor: pointer;
        user-select: none;
      }
      
      .debug-bug-emoji:hover {
        opacity: 0.7;
      }
      
      .debug-section {
        margin-bottom: 15px;
      }
      
      .debug-section h4 {
        margin: 0 0 8px 0;
        color: #6c757d;
        font-size: 14px;
        font-weight: 600;
      }
      
      .debug-model-state {
        background: #ffffff;
        border: 1px solid #ced4da;
        border-radius: 4px;
        padding: 10px;
        margin: 0;
        font-size: 12px;
        line-height: 1.4;
        max-height: 150px;
        overflow-y: auto;
        color: #495057;
      }
      
      .debug-event-history {
        background: #ffffff;
        border: 1px solid #ced4da;
        border-radius: 4px;
        padding: 8px;
        max-height: 120px;
        overflow-y: auto;
      }
      
      .debug-event {
        padding: 4px 0;
        border-bottom: 1px solid #f8f9fa;
        font-size: 12px;
      }
      
      .debug-event:last-child {
        border-bottom: none;
      }
      
      .debug-event-type {
        font-weight: 600;
        color: #007bff;
      }
      
      .debug-event-time {
        color: #6c757d;
        font-size: 11px;
      }
      
      .debug-performance, .debug-canvas-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        font-size: 13px;
      }
      
      .debug-performance > div, .debug-canvas-info > div {
        padding: 6px 8px;
        background: #ffffff;
        border: 1px solid #ced4da;
        border-radius: 4px;
      }
      
      .debug-fps, .debug-render-time, .debug-avg-render, .debug-render-count,
      .debug-canvas-size, .debug-layer-count {
        font-weight: 600;
        color: #28a745;
      }
      
      .debug-layer-controls {
        background: #ffffff;
        border: 1px solid #ced4da;
        border-radius: 4px;
        padding: 8px;
        max-height: 150px;
        overflow-y: auto;
      }
      
      .layer-control {
        margin-bottom: 6px;
      }
      
      .layer-control:last-child {
        margin-bottom: 0;
      }
      
      .layer-control-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 13px;
        gap: 6px;
      }
      
      .layer-control-label:hover {
        background-color: #f8f9fa;
        border-radius: 3px;
        padding: 2px 4px;
      }
      
      .layer-visibility-checkbox {
        margin: 0;
        cursor: pointer;
      }
      
      .layer-order {
        color: #6c757d;
        font-size: 12px;
        min-width: 20px;
      }
      
      .layer-name {
        font-weight: 500;
        color: #495057;
      }
    `;
    document.head.appendChild(style);
  }

  private attachEventHandlers(): void {
    const toggleFunction = () => {
      this.expanded = !this.expanded;
      const header = this.panelElement.querySelector(
        '.debug-header'
      ) as HTMLElement;
      const content = this.panelElement.querySelector(
        '.debug-content'
      ) as HTMLElement;
      const collapsedToggle = this.panelElement.querySelector(
        '.debug-toggle-collapsed'
      ) as HTMLElement;

      // Toggle CSS class for styling
      if (this.expanded) {
        this.panelElement.classList.add('expanded');
      } else {
        this.panelElement.classList.remove('expanded');
      }

      header.style.display = this.expanded ? 'flex' : 'none';
      content.style.display = this.expanded ? 'block' : 'none';
      collapsedToggle.style.display = this.expanded ? 'none' : 'block';
    };

    // Toggle panel visibility from all buttons
    this.toggleButton.addEventListener('click', toggleFunction);
    const collapsedToggle = this.panelElement.querySelector(
      '.debug-toggle-collapsed'
    )!;
    collapsedToggle.addEventListener('click', toggleFunction);
    const bugEmoji = this.panelElement.querySelector('.debug-bug-emoji')!;
    bugEmoji.addEventListener('click', toggleFunction);

    // Attach to surface events
    this.surface.onClick((event: MeleteMouseEvent) => {
      this.addEvent('click', {
        canvasX: event.canvasX,
        canvasY: event.canvasY,
        button: event.button,
      });
    });

    // Monitor model changes by intercepting setModel
    const originalSetModel = this.surface.setModel.bind(this.surface);
    this.surface.setModel = (newModel: T) => {
      originalSetModel(newModel);
      this.addEvent('model-update', { model: newModel });
      this.updateModelState();
    };

    // Monitor renders by intercepting render method
    const originalRender = this.surface.render.bind(this.surface);
    this.surface.render = (tick?: number) => {
      const startTime = performance.now();
      originalRender(tick);
      const endTime = performance.now();

      this.recordRenderTime(endTime - startTime);
      this.addEvent('render', {
        renderTime: endTime - startTime,
        tick: tick,
      });
    };
  }

  private addEvent(type: string, data: any): void {
    const event: DebugEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxEventHistory) {
      this.eventHistory.pop();
    }

    this.updateEventHistory();
  }

  private recordRenderTime(renderTime: number): void {
    this.performanceData.lastRenderTime = renderTime;
    this.performanceData.renderCount++;

    // Calculate running average
    const alpha = 0.1; // Smoothing factor
    if (this.performanceData.averageRenderTime === 0) {
      this.performanceData.averageRenderTime = renderTime;
    } else {
      this.performanceData.averageRenderTime =
        alpha * renderTime +
        (1 - alpha) * this.performanceData.averageRenderTime;
    }

    this.frameCount++;
    this.updatePerformance();
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastFpsUpdate;

      if (elapsed >= 1000) {
        this.performanceData.fps = Math.round(
          (this.frameCount * 1000) / elapsed
        );
        this.frameCount = 0;
        this.lastFpsUpdate = now;
        this.updatePerformance();
      }
    }, this.updateInterval);
  }

  private updateModelState(): void {
    const model = this.surface.getModel();
    this.modelStateElement.textContent = JSON.stringify(model, null, 2);
  }

  private updateEventHistory(): void {
    if (this.eventHistory.length === 0) {
      this.eventHistoryElement.innerHTML =
        '<div style="color: #6c757d; font-style: italic;">No events yet</div>';
      return;
    }

    this.eventHistoryElement.innerHTML = this.eventHistory
      .map(event => {
        const time = new Date(event.timestamp).toLocaleTimeString();
        const dataStr = this.formatEventData(event.type, event.data);
        return `
          <div class="debug-event">
            <span class="debug-event-type">${event.type}</span>
            ${dataStr}
            <div class="debug-event-time">${time}</div>
          </div>
        `;
      })
      .join('');
  }

  private formatEventData(type: string, data: any): string {
    switch (type) {
      case 'click':
        return ` at (${data.canvasX}, ${data.canvasY})`;
      case 'render':
        return ` (${data.renderTime.toFixed(1)}ms)`;
      case 'model-update':
        return ' - model changed';
      default:
        return '';
    }
  }

  private updatePerformance(): void {
    const fpsElement = this.performanceElement.querySelector('.debug-fps')!;
    const renderTimeElement =
      this.performanceElement.querySelector('.debug-render-time')!;
    const avgRenderElement =
      this.performanceElement.querySelector('.debug-avg-render')!;
    const renderCountElement = this.performanceElement.querySelector(
      '.debug-render-count'
    )!;

    fpsElement.textContent = this.performanceData.fps.toString();
    renderTimeElement.textContent =
      this.performanceData.lastRenderTime.toFixed(1);
    avgRenderElement.textContent =
      this.performanceData.averageRenderTime.toFixed(1);
    renderCountElement.textContent =
      this.performanceData.renderCount.toString();
  }

  private updateCanvasInfo(): void {
    const canvas = this.surface.getCanvas();
    const canvasElement = canvas.getElement();

    const sizeElement =
      this.canvasInfoElement.querySelector('.debug-canvas-size')!;
    const layerCountElement =
      this.canvasInfoElement.querySelector('.debug-layer-count')!;

    sizeElement.textContent = `${canvasElement.width}×${canvasElement.height}`;

    // Count layers by checking the layer schema
    const layerCount = Object.keys((this.surface as any).layerSchema).length;
    layerCountElement.textContent = layerCount.toString();
  }

  private updateLayerControls(): void {
    const layerNames = this.surface.getLayerNames();

    // Create checkbox controls for each layer
    const controlsHtml = layerNames
      .map((layerName, index) => {
        const isVisible = this.surface.isLayerVisible(layerName);
        const layerNameStr = String(layerName);

        return `
          <div class="layer-control">
            <label class="layer-control-label">
              <input 
                type="checkbox" 
                class="layer-visibility-checkbox" 
                data-layer="${layerNameStr}"
                ${isVisible ? 'checked' : ''}
              />
              <span class="layer-order">${index + 1}.</span>
              <span class="layer-name">${layerNameStr}</span>
            </label>
          </div>
        `;
      })
      .join('');

    this.layerControlsElement.innerHTML = controlsHtml;

    // Add event listeners to checkboxes
    const checkboxes = this.layerControlsElement.querySelectorAll(
      '.layer-visibility-checkbox'
    );

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', event => {
        const target = event.target as HTMLInputElement;
        const layerName = target.dataset.layer!;
        const isVisible = target.checked;

        this.surface.setLayerVisible(layerName, isVisible);
        this.surface.rerender();
      });
    });
  }

  destroy(): void {
    if (this.panelElement && this.panelElement.parentNode) {
      this.panelElement.parentNode.removeChild(this.panelElement);
    }
  }
}
