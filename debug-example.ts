/**
 * Example usage of Chrome debugging tools
 * Shows how to integrate debugging into your development workflow
 */

import { ChromeDebugger, DebugWorkflow } from './debug-chrome.ts';

async function exampleDebuggingWorkflow() {
  const chromeDebugger = new ChromeDebugger();
  const workflow = new DebugWorkflow(chromeDebugger);

  try {
    // 1. List existing Chrome tabs
    console.log('📋 Checking for open Chrome tabs...');
    const pages = await chromeDebugger.listPages();
    
    if (pages.length === 0) {
      console.log('ℹ️  No Chrome tabs found. Start Chrome with:');
      console.log('   npm run debug:start');
      return;
    }

    // 2. Find your webapp (assumes localhost)
    const myApp = pages.find(page => page.url.includes('localhost'));
    if (!myApp) {
      console.log('⚠️  No localhost app found. Available pages:');
      pages.forEach(page => console.log(`   ${page.title}: ${page.url}`));
      return;
    }

    console.log(`🔍 Found app: ${myApp.title} (${myApp.url})`);

    // 3. Connect and run comprehensive inspection
    console.log('🔌 Connecting to page...');
    await chromeDebugger.connectToPage(myApp.id);

    console.log('🕵️  Running inspection...');
    const results = await workflow.inspect(myApp.id);

    // 4. Report results
    console.log('\n📊 Inspection Results:');
    console.log(`   Load Time: ${results.performance.loadTime}ms`);
    console.log(`   DOM Ready: ${results.performance.domReady}ms`);
    console.log(`   DOM Nodes: ${results.domNodes}`);
    console.log(`   Scripts: ${results.scripts}`);
    console.log(`   Console Errors: ${results.errors.length}`);

    if (results.performance.memory) {
      const mb = (bytes: number) => Math.round(bytes / 1024 / 1024);
      console.log(`   Memory Used: ${mb(results.performance.memory.usedJSHeapSize)}MB`);
    }

    // 5. Show any errors
    if (results.errors.length > 0) {
      console.log('\n❌ Console Errors:');
      results.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. [${error.level}] ${error.text}`);
        if (error.source && error.line) {
          console.log(`      at ${error.source}:${error.line}`);
        }
      });
    } else {
      console.log('✅ No console errors found!');
    }

    // 6. Example: Execute custom JavaScript
    console.log('\n🔧 Running custom checks...');
    const customChecks = await chromeDebugger.evaluateJavaScript(myApp.id, `
      ({
        title: document.title,
        hasCanvas: !!document.querySelector('canvas'),
        viewportSize: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        userAgent: navigator.userAgent.split(' ').pop()
      })
    `);

    console.log(`   Page Title: ${customChecks.title}`);
    console.log(`   Has Canvas: ${customChecks.hasCanvas ? '✅' : '❌'}`);
    console.log(`   Viewport: ${customChecks.viewportSize.width}x${customChecks.viewportSize.height}`);
    console.log(`   Browser: ${customChecks.userAgent}`);

  } catch (error) {
    console.error('💥 Debugging failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Tip: Make sure Chrome is running with debugging enabled:');
      console.log('   npm run debug:start http://localhost:3000');
    }
  } finally {
    await chromeDebugger.disconnectAll();
  }
}

// Example: Monitor console in real-time
async function monitorConsoleExample() {
  const chromeDebugger = new ChromeDebugger();
  
  try {
    const pages = await chromeDebugger.listPages();
    const myApp = pages.find(page => page.url.includes('localhost'));
    
    if (!myApp) {
      console.log('No localhost app found');
      return;
    }

    console.log(`🎧 Monitoring console for: ${myApp.title}`);
    console.log('   (Press Ctrl+C to stop)');
    
    await chromeDebugger.connectToPage(myApp.id);
    const consoleStream = await chromeDebugger.enableConsole(myApp.id);

    for await (const message of consoleStream) {
      const time = new Date(message.timestamp).toLocaleTimeString();
      const emoji = {
        error: '❌',
        warn: '⚠️',
        info: 'ℹ️',
        log: '📝',
        debug: '🐛'
      }[message.level] || '📝';
      
      console.log(`[${time}] ${emoji} ${message.text}`);
    }
    
  } catch (error) {
    console.error('Console monitoring failed:', error.message);
  } finally {
    await chromeDebugger.disconnectAll();
  }
}

// Run example based on command line argument
const command = process.argv[2];

if (command === 'monitor') {
  monitorConsoleExample().catch(console.error);
} else {
  exampleDebuggingWorkflow().catch(console.error);
}