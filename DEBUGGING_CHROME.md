# Chrome Remote Debugging for Claude Code

This guide shows how to debug web applications using Chrome's remote debugging protocol, which Claude Code can access directly via HTTP/WebSocket APIs.

## Quick Start

1. **Start Chrome with debugging enabled:**

```bash
# Kill any existing Chrome debug instances
pkill -f "chrome.*remote-debugging"

# Start Chrome with remote debugging (replace URL with your webapp)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug \
  "http://localhost:3000" > /dev/null 2>&1 &
```

2. **Verify connection:**

```bash
curl -s http://localhost:9222/json/list | python3 -m json.tool
```

3. **Ask Claude Code to inspect your webapp** - Claude can now use HTTP/WebSocket APIs to debug your application.

## Commands for Claude Code

Once Chrome is running with remote debugging, Claude Code can use these patterns:

### List all open tabs/pages:

```bash
curl -s http://localhost:9222/json/list | python3 -m json.tool
```

### Create new tab with your webapp:

```bash
curl -s -X PUT "http://localhost:9222/json/new?http://localhost:3000"
```

### Get console logs (Python WebSocket example):

```python
import asyncio
import websockets
import json

async def get_console_logs(page_id):
    uri = f'ws://localhost:9222/devtools/page/{page_id}'
    async with websockets.connect(uri) as websocket:
        # Enable Console domain
        await websocket.send(json.dumps({
            'id': 1, 'method': 'Console.enable'
        }))
        await websocket.recv()

        # Listen for console messages
        while True:
            message = await websocket.recv()
            data = json.loads(message)
            if data.get('method') == 'Console.messageAdded':
                msg = data['params']['message']
                print(f"[{msg['level']}] {msg['text']}")
```

### Execute JavaScript:

```python
async def run_javascript(page_id, code):
    uri = f'ws://localhost:9222/devtools/page/{page_id}'
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({
            'id': 1,
            'method': 'Runtime.evaluate',
            'params': {'expression': code}
        }))
        response = await websocket.recv()
        return json.loads(response)
```

## Platform-Specific Chrome Paths

### macOS:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
```

### Linux:

```bash
google-chrome
# or
chromium-browser
```

### Windows:

```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe"
```

## Common Debugging Tasks

### 1. Check for JavaScript errors:

```python
# Execute via WebSocket to page
expression = '''
(function() {
    const errors = [];
    const originalError = console.error;
    console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
    };
    return errors;
})()
'''
```

### 2. Monitor network requests:

```python
# Enable Network domain first
await websocket.send(json.dumps({
    'id': 1, 'method': 'Network.enable'
}))

# Listen for Network.requestWillBeSent events
```

### 3. Get page performance metrics:

```python
expression = '''
JSON.stringify({
    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
    domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
    resources: performance.getEntriesByType('resource').length
})
'''
```

### 4. Inspect DOM elements:

```python
expression = '''
document.querySelectorAll('[data-testid]').length
'''
```

## Advantages of This Approach

- ✅ **Reliable**: Uses Chrome's stable DevTools Protocol
- ✅ **Fast setup**: 30 seconds vs hours
- ✅ **No dependencies**: Just Chrome + basic HTTP/WebSocket
- ✅ **Direct access**: Claude Code can use HTTP/WebSocket tools directly
- ✅ **Real browser**: Same rendering engine as users
- ✅ **No installation**: No Python packages, no MCP servers

## Example Workflow

1. **Start your webapp**: `npm run dev` (or whatever)
2. **Start Chrome debugging**: Use the command above with your URL
3. **Ask Claude Code**: "Can you check my webapp for console errors?"
4. **Claude executes**: HTTP calls to get page info, WebSocket for real-time debugging

## Notes

- Use a separate Chrome profile (`--user-data-dir`) to avoid conflicts
- The debugging port (9222) should not conflict with your webapp port
- Chrome will stay open until you kill the process
- Multiple tabs/windows are supported - each has a unique page ID

This approach gives Claude Code full debugging capabilities without the complexity and reliability issues of the MCP server.
