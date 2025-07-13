#!/usr/bin/env node
/**
 * CLI script for debugging Chrome applications
 * Usage examples for the Chrome debugging workflow
 */

import { ChromeDebugger, DebugWorkflow } from './debug-chrome.ts';
import { spawn } from 'child_process';
import { platform } from 'os';

const CHROME_PATHS = {
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  linux: 'google-chrome',
  win32: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"'
};

/**
 * Start Chrome with remote debugging enabled
 */
export function startChromeWithDebugging(url = 'http://localhost:3000', port = 9222): Promise<void> {
  const chromePath = CHROME_PATHS[platform() as keyof typeof CHROME_PATHS];
  if (!chromePath) {
    throw new Error(`Unsupported platform: ${platform()}`);
  }

  // Kill existing debug instances
  spawn('pkill', ['-f', 'chrome.*remote-debugging'], { stdio: 'ignore' });

  // Wait a moment for cleanup
  return new Promise((resolve) => {
    setTimeout(() => {
      const args = [
        '--remote-debugging-port=' + port,
        '--user-data-dir=/tmp/chrome-debug',
        url
      ];

      const chrome = spawn(chromePath, args, {
        stdio: 'ignore',
        detached: true
      });

      chrome.unref();
      
      // Give Chrome time to start
      setTimeout(resolve, 2000);
    }, 500);
  });
}

/**
 * Main debugging workflow examples
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const url = args[1] || 'http://localhost:3000';

  const chromeDebugger = new ChromeDebugger();
  const workflow = new DebugWorkflow(chromeDebugger);

  try {
    switch (command) {
      case 'start':
        console.log(`Starting Chrome with debugging for ${url}...`);
        await startChromeWithDebugging(url);
        console.log('Chrome started. Use other commands to debug.');
        break;

      case 'list':
        console.log('Listing open tabs:');
        const pages = await chromeDebugger.listPages();
        pages.forEach(page => {
          console.log(`  ${page.id}: ${page.title} (${page.url})`);
        });
        break;

      case 'inspect':
        const pageId = args[1];
        if (!pageId) {
          console.error('Usage: inspect <pageId>');
          process.exit(1);
        }
        
        console.log(`Inspecting page ${pageId}...`);
        await chromeDebugger.connectToPage(pageId);
        const inspection = await workflow.inspect(pageId);
        
        console.log('Inspection Results:');
        console.log('Performance:', inspection.performance);
        console.log('DOM Nodes:', inspection.domNodes);
        console.log('Scripts:', inspection.scripts);
        console.log('Errors:', inspection.errors.length);
        
        if (inspection.errors.length > 0) {
          console.log('Console Errors:');
          inspection.errors.forEach(error => {
            console.log(`  [${error.level}] ${error.text}`);
          });
        }
        
        await chromeDebugger.disconnect(pageId);
        break;

      case 'console':
        const consolePageId = args[1];
        if (!consolePageId) {
          console.error('Usage: console <pageId>');
          process.exit(1);
        }
        
        console.log(`Monitoring console for page ${consolePageId}...`);
        await chromeDebugger.connectToPage(consolePageId);
        
        const consoleStream = await chromeDebugger.enableConsole(consolePageId);
        console.log('Listening for console messages (Ctrl+C to stop):');
        
        for await (const message of consoleStream) {
          const timestamp = new Date(message.timestamp).toLocaleTimeString();
          console.log(`[${timestamp}] [${message.level.toUpperCase()}] ${message.text}`);
        }
        break;

      case 'exec':
        const execPageId = args[1];
        const code = args[2];
        if (!execPageId || !code) {
          console.error('Usage: exec <pageId> <javascript-code>');
          process.exit(1);
        }
        
        await chromeDebugger.connectToPage(execPageId);
        const result = await chromeDebugger.evaluateJavaScript(execPageId, code);
        console.log('Result:', result);
        await chromeDebugger.disconnect(execPageId);
        break;

      case 'breakpoint':
        const bpPageId = args[1];
        const bpUrl = args[2];
        const lineNumber = parseInt(args[3]);
        
        if (!bpPageId || !bpUrl || !lineNumber) {
          console.error('Usage: breakpoint <pageId> <url> <lineNumber>');
          process.exit(1);
        }
        
        await chromeDebugger.connectToPage(bpPageId);
        const breakpointId = await chromeDebugger.setBreakpoint(bpPageId, bpUrl, lineNumber);
        console.log(`Breakpoint set: ${breakpointId} at ${bpUrl}:${lineNumber}`);
        break;

      case 'demo':
        console.log('Demo: Complete debugging workflow');
        console.log('1. Starting Chrome...');
        await startChromeWithDebugging(url);
        
        console.log('2. Waiting for page to load...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('3. Getting page info...');
        const demoPages = await chromeDebugger.listPages();
        const demoPage = demoPages.find(p => p.url.includes('localhost'));
        
        if (!demoPage) {
          console.log('No localhost page found. Available pages:');
          demoPages.forEach(p => console.log(`  ${p.title}: ${p.url}`));
          break;
        }
        
        console.log(`4. Inspecting page: ${demoPage.title}`);
        const demoInspection = await workflow.inspect(demoPage.id);
        
        console.log('Demo Results:');
        console.log('- Load time:', demoInspection.performance.loadTime + 'ms');
        console.log('- DOM nodes:', demoInspection.domNodes);
        console.log('- Console errors:', demoInspection.errors.length);
        
        await chromeDebugger.disconnectAll();
        break;

      default:
        console.log('Chrome DevTools CLI');
        console.log('Commands:');
        console.log('  start [url]           - Start Chrome with debugging');
        console.log('  list                  - List open tabs');
        console.log('  inspect <pageId>      - Inspect a page');
        console.log('  console <pageId>      - Monitor console messages');
        console.log('  exec <pageId> <code>  - Execute JavaScript');
        console.log('  breakpoint <pageId> <url> <line> - Set breakpoint');
        console.log('  demo [url]            - Run complete demo workflow');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await chromeDebugger.disconnectAll();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}