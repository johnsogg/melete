# Chrome Debugging Workflow

TypeScript-based Chrome debugging tools that allow Claude Code to inspect running web applications without Python dependencies.

## Setup and Usage

1. **Start Chrome with debugging enabled:**

```bash
node --experimental-strip-types debug-cli.ts start [url]
# Example: node --experimental-strip-types debug-cli.ts start http://localhost:5173
```

2. **List open tabs to get page IDs:**

```bash
node --experimental-strip-types debug-cli.ts list
```

3. **Common debugging commands:**

```bash
# Execute JavaScript in a page
node --experimental-strip-types debug-cli.ts exec <pageId> "document.title"

# Monitor console messages (Ctrl+C to stop)
node --experimental-strip-types debug-cli.ts console <pageId>

# Run comprehensive inspection
node --experimental-strip-types debug-cli.ts inspect <pageId>

# Set breakpoints via debugger injection
node --experimental-strip-types debug-cli.ts exec <pageId> "debugger;"

# Run complete demo workflow
node --experimental-strip-types debug-cli.ts demo [url]
```

## Key Files

- `debug-chrome.ts` - Core debugging library with ChromeDebugger and DebugWorkflow classes
- `debug-cli.ts` - Command-line interface for debugging operations
- `debug-example.ts` - Usage examples and workflow demonstrations

## Capabilities

- Real-time console monitoring via WebSocket
- JavaScript execution in page context
- Performance metrics collection
- DOM inspection and form value reading
- Breakpoint setting via debugger injection
- Multi-tab session management

## Requirements

- Node.js 22.6+ with `--experimental-strip-types` flag
- Chrome browser
- WebSocket library (`ws`) installed as dev dependency

## Technical Details

Uses Chrome's stable DevTools Protocol over HTTP/WebSocket, avoiding the complexity and reliability issues of browser automation tools or MCP servers.

## Example Workflow

```bash
# 1. Start your web app
npm run dev

# 2. Start Chrome with debugging
node --experimental-strip-types debug-cli.ts start http://localhost:5173

# 3. Get page ID
node --experimental-strip-types debug-cli.ts list

# 4. Debug the app
node --experimental-strip-types debug-cli.ts exec <pageId> "document.querySelector('input').value"
```
