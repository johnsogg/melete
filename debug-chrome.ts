/**
 * Chrome DevTools Protocol client for debugging web applications
 * TypeScript implementation to replace Python debugging workflow
 */

import { WebSocket } from 'ws';

export interface ChromePage {
  id: string;
  title: string;
  url: string;
  webSocketDebuggerUrl: string;
  type: string;
}

export interface ConsoleMessage {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  text: string;
  timestamp: number;
  source?: string;
  line?: number;
  column?: number;
}

export interface DebuggerSession {
  pageId: string;
  websocket: WebSocket;
  messageId: number;
}

export class ChromeDebugger {
  private debugPort: number;
  private sessions = new Map<string, DebuggerSession>();

  constructor(debugPort = 9222) {
    this.debugPort = debugPort;
  }

  /**
   * List all open tabs/pages in Chrome
   */
  async listPages(): Promise<ChromePage[]> {
    const response = await fetch(`http://localhost:${this.debugPort}/json/list`);
    if (!response.ok) {
      throw new Error(`Failed to connect to Chrome debugging port ${this.debugPort}`);
    }
    return response.json();
  }

  /**
   * Create a new tab with the specified URL
   */
  async createTab(url: string): Promise<ChromePage> {
    const response = await fetch(`http://localhost:${this.debugPort}/json/new?${encodeURIComponent(url)}`, {
      method: 'PUT'
    });
    if (!response.ok) {
      throw new Error('Failed to create new tab');
    }
    return response.json();
  }

  /**
   * Close a tab by page ID
   */
  async closeTab(pageId: string): Promise<void> {
    const response = await fetch(`http://localhost:${this.debugPort}/json/close/${pageId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to close tab ${pageId}`);
    }
  }

  /**
   * Connect to a page via WebSocket for real-time debugging
   */
  async connectToPage(pageId: string): Promise<DebuggerSession> {
    const pages = await this.listPages();
    const page = pages.find(p => p.id === pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    
    return new Promise((resolve, reject) => {
      ws.on('open', () => {
        const session: DebuggerSession = {
          pageId,
          websocket: ws,
          messageId: 1
        };
        this.sessions.set(pageId, session);
        resolve(session);
      });

      ws.on('error', reject);
    });
  }

  /**
   * Send a command to the debugging session
   */
  private async sendCommand(session: DebuggerSession, method: string, params?: any): Promise<any> {
    const message = {
      id: session.messageId++,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Command timeout')), 10000);

      const handler = (data: Buffer) => {
        const response = JSON.parse(data.toString());
        if (response.id === message.id) {
          clearTimeout(timeout);
          session.websocket.off('message', handler);
          
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.result);
          }
        }
      };

      session.websocket.on('message', handler);
      session.websocket.send(JSON.stringify(message));
    });
  }

  /**
   * Enable console logging and return a stream of console messages
   */
  async enableConsole(pageId: string): Promise<AsyncGenerator<ConsoleMessage>> {
    const session = this.sessions.get(pageId);
    if (!session) {
      throw new Error(`No active session for page ${pageId}`);
    }

    // Enable Console domain
    await this.sendCommand(session, 'Console.enable');

    const messageQueue: ConsoleMessage[] = [];
    let resolveNext: ((value: IteratorResult<ConsoleMessage>) => void) | null = null;

    session.websocket.on('message', (data: Buffer) => {
      const message = JSON.parse(data.toString());
      if (message.method === 'Console.messageAdded') {
        const consoleMsg: ConsoleMessage = {
          level: message.params.message.level,
          text: message.params.message.text,
          timestamp: Date.now(),
          source: message.params.message.source,
          line: message.params.message.line,
          column: message.params.message.column
        };

        if (resolveNext) {
          resolveNext({ value: consoleMsg, done: false });
          resolveNext = null;
        } else {
          messageQueue.push(consoleMsg);
        }
      }
    });

    return {
      async *[Symbol.asyncIterator]() {
        while (true) {
          if (messageQueue.length > 0) {
            yield messageQueue.shift()!;
          } else {
            yield await new Promise<ConsoleMessage>((resolve) => {
              resolveNext = (result) => resolve(result.value);
            });
          }
        }
      }
    }[Symbol.asyncIterator]();
  }

  /**
   * Execute JavaScript code in the page context
   */
  async evaluateJavaScript(pageId: string, expression: string): Promise<any> {
    const session = this.sessions.get(pageId);
    if (!session) {
      throw new Error(`No active session for page ${pageId}`);
    }

    const result = await this.sendCommand(session, 'Runtime.evaluate', {
      expression,
      returnByValue: true
    });

    if (result.exceptionDetails) {
      throw new Error(`JavaScript execution failed: ${result.exceptionDetails.text}`);
    }

    return result.result.value;
  }

  /**
   * Set a breakpoint at a specific line in a file
   */
  async setBreakpoint(pageId: string, url: string, lineNumber: number): Promise<string> {
    const session = this.sessions.get(pageId);
    if (!session) {
      throw new Error(`No active session for page ${pageId}`);
    }

    // Enable Debugger domain
    await this.sendCommand(session, 'Debugger.enable');

    const result = await this.sendCommand(session, 'Debugger.setBreakpointByUrl', {
      lineNumber,
      url
    });

    return result.breakpointId;
  }

  /**
   * Remove a breakpoint
   */
  async removeBreakpoint(pageId: string, breakpointId: string): Promise<void> {
    const session = this.sessions.get(pageId);
    if (!session) {
      throw new Error(`No active session for page ${pageId}`);
    }

    await this.sendCommand(session, 'Debugger.removeBreakpoint', {
      breakpointId
    });
  }

  /**
   * Continue execution when paused at a breakpoint
   */
  async resume(pageId: string): Promise<void> {
    const session = this.sessions.get(pageId);
    if (!session) {
      throw new Error(`No active session for page ${pageId}`);
    }

    await this.sendCommand(session, 'Debugger.resume');
  }

  /**
   * Step over the current line
   */
  async stepOver(pageId: string): Promise<void> {
    const session = this.sessions.get(pageId);
    if (!session) {
      throw new Error(`No active session for page ${pageId}`);
    }

    await this.sendCommand(session, 'Debugger.stepOver');
  }

  /**
   * Step into the current function call
   */
  async stepInto(pageId: string): Promise<void> {
    const session = this.sessions.get(pageId);
    if (!session) {
      throw new Error(`No active session for page ${pageId}`);
    }

    await this.sendCommand(session, 'Debugger.stepInto');
  }

  /**
   * Get the current call stack when paused
   */
  async getCallStack(pageId: string): Promise<any> {
    const session = this.sessions.get(pageId);
    if (!session) {
      throw new Error(`No active session for page ${pageId}`);
    }

    return this.sendCommand(session, 'Debugger.getStackTrace');
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(pageId: string): Promise<any> {
    return this.evaluateJavaScript(pageId, `
      JSON.stringify({
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        resources: performance.getEntriesByType('resource').length,
        memory: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null
      })
    `);
  }

  /**
   * Close debugging session
   */
  async disconnect(pageId: string): Promise<void> {
    const session = this.sessions.get(pageId);
    if (session) {
      session.websocket.close();
      this.sessions.delete(pageId);
    }
  }

  /**
   * Close all sessions
   */
  async disconnectAll(): Promise<void> {
    for (const [pageId] of this.sessions) {
      await this.disconnect(pageId);
    }
  }
}

// Helper functions for common debugging workflows
export class DebugWorkflow {
  private chromeDebugger: ChromeDebugger;

  constructor(chromeDebugger: ChromeDebugger) {
    this.chromeDebugger = chromeDebugger;
  }

  /**
   * Quick setup: Start debugging a specific URL
   */
  async debugUrl(url: string): Promise<string> {
    const page = await this.chromeDebugger.createTab(url);
    await this.chromeDebugger.connectToPage(page.id);
    return page.id;
  }

  /**
   * Check for JavaScript errors in the console
   */
  async checkForErrors(pageId: string, timeoutMs = 5000): Promise<ConsoleMessage[]> {
    const errors: ConsoleMessage[] = [];
    const consoleStream = await this.chromeDebugger.enableConsole(pageId);
    
    const timeout = setTimeout(() => {}, timeoutMs);
    
    try {
      for await (const message of consoleStream) {
        if (message.level === 'error') {
          errors.push(message);
        }
        
        if (Date.now() - message.timestamp > timeoutMs) {
          break;
        }
      }
    } catch (e) {
      // Stream ended or timed out
    }
    
    clearTimeout(timeout);
    return errors;
  }

  /**
   * Monitor console for a specific period and return all messages
   */
  async monitorConsole(pageId: string, durationMs = 10000): Promise<ConsoleMessage[]> {
    const messages: ConsoleMessage[] = [];
    const consoleStream = await this.chromeDebugger.enableConsole(pageId);
    const startTime = Date.now();
    
    try {
      for await (const message of consoleStream) {
        messages.push(message);
        
        if (Date.now() - startTime > durationMs) {
          break;
        }
      }
    } catch (e) {
      // Stream ended
    }
    
    return messages;
  }

  /**
   * Run a series of debugging commands and collect results
   */
  async inspect(pageId: string): Promise<{
    performance: any;
    errors: ConsoleMessage[];
    domNodes: number;
    scripts: number;
  }> {
    const [performance, errors, domNodes, scripts] = await Promise.all([
      this.chromeDebugger.getPerformanceMetrics(pageId),
      this.checkForErrors(pageId, 2000),
      this.chromeDebugger.evaluateJavaScript(pageId, 'document.querySelectorAll("*").length'),
      this.chromeDebugger.evaluateJavaScript(pageId, 'document.scripts.length')
    ]);

    return {
      performance: JSON.parse(performance),
      errors,
      domNodes,
      scripts
    };
  }
}