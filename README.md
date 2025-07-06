# Melete

A TypeScript graphics library for creating web-based visual content including procedurally generated art, interactive lecture slides, and educational visualizations.

## Features

- **🐢 Turtle Graphics**: Logo-inspired drawing paradigm for intuitive geometric programming
- **🎨 Canvas-Based Rendering**: High-performance drawing using HTML5 Canvas API
- **📚 Layered Architecture**: Composable drawing layers with caching and animation support
- **🔧 Modern TypeScript**: Full type safety and excellent developer experience
- **📐 Geometry Utilities**: Mathematical foundations for complex graphics operations
- **🎯 Educational Focus**: Designed for teaching programming and mathematical concepts

## Quick Start

```bash
npm install @johnsogg/melete
```

```typescript
import { createCanvas, DrawingSurface } from '@johnsogg/melete';

// Create a canvas
const canvas = createCanvas(document.getElementById('canvas'), {
  width: 800,
  height: 600
});

// Set up a drawing surface with layers
const surface = new DrawingSurface({
  model: { greeting: "Hello, Melete!" },
  layerSchema: {
    background: { cache: true, offscreen: false },
    content: { cache: false, offscreen: false }
  },
  canvasOptions: { width: 800, height: 600 }
});

// Draw with the layer system
surface.getLayer('background').onDemand(({ layer }) => {
  layer.clear('#f0f0f0');
});

surface.getLayer('content').onDemand(({ model, layer }) => {
  layer.drawText({
    text: model.greeting,
    position: { x: 400, y: 300 },
    fillStyle: '#333',
    font: '24px Arial'
  });
});

surface.render();
```

## Architecture

### Core Components

- **Canvas** (`lib/canvas.ts`): Low-level canvas management and context handling
- **Surface** (`lib/surface.ts`): High-level drawing surface with layer orchestration
- **Layer** (`lib/layer.ts`): Individual drawing layers with caching and animation support
- **Graphics** (`lib/graphics/`): Drawing primitives and utilities
- **Turtle** (`lib/turtle/`): Logo-inspired turtle graphics system
- **Geometry** (`lib/geom/`): Mathematical utilities and geometric operations

### Directory Structure

```
lib/
├── index.ts              # Main library exports
├── types.ts              # Core type definitions
├── canvas.ts             # Canvas management
├── surface.ts            # Drawing surface orchestration
├── layer.ts              # Layer system implementation
├── debug.ts              # Debug utilities
├── graphics/             # Drawing primitives
│   ├── index.ts          # Graphics exports
│   ├── types.ts          # Graphics type definitions
│   ├── draw*.ts          # Individual drawing functions
│   ├── textUtils.ts      # Text measurement utilities
│   └── utils.ts          # Graphics utilities
├── turtle/               # Turtle graphics system
│   ├── index.ts          # Turtle exports
│   ├── engine.ts         # Command execution engine
│   ├── commands.ts       # Turtle command definitions
│   ├── state.ts          # Turtle state management
│   ├── path.ts           # Path generation
│   ├── stack.ts          # State stack for hierarchical operations
│   └── math/             # Mathematical utilities
│       ├── vector.ts     # Vector operations
│       ├── matrix.ts     # Matrix operations
│       └── index.ts      # Math exports
├── geom/                 # Geometry utilities
│   ├── index.ts          # Geometry exports
│   └── types.ts          # Geometric type definitions
└── models/               # High-level models
    └── boxarrow/         # Box-and-arrow diagram model
        └── index.ts      # Box-arrow implementation
```

## Drawing Systems

### Layer-Based Drawing

The layer system allows complex graphics to be composed from multiple cached or animated layers:

```typescript
const surface = new DrawingSurface({
  model: gameState,
  layerSchema: {
    background: { cache: true, offscreen: false },
    terrain: { cache: true, offscreen: false },
    entities: { cache: false, offscreen: false, animated: true },
    ui: { cache: false, offscreen: false }
  }
});
```

### Turtle Graphics

Inspired by Logo, the turtle graphics system provides an intuitive way to create complex patterns:

```typescript
import { drawTurtleSequence, forward, turn, penUp, penDown } from '@johnsogg/melete';

const commands = [
  penDown(),
  ...Array(4).fill(null).flatMap(() => [
    forward(100),
    turn(90)
  ])
];

const finalState = drawTurtleSequence(commands);
```

### Graphics Primitives

Low-level drawing functions for direct canvas manipulation:

```typescript
import { drawCircleStyled, drawRectStyled } from '@johnsogg/melete';

drawCircleStyled({
  ctx,
  center: { x: 100, y: 100 },
  radius: 50,
  style: { fillStyle: '#ff6b6b', strokeStyle: '#333', lineWidth: 2 }
});
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build

# Run tests
npm run test

# Run linting and type checking
npm run check
```

## Demos

The library includes comprehensive demos showcasing different features:

- **Hello World**: Basic canvas operations and drawing primitives
- **Layers**: Multi-layer composition with caching
- **Animation**: Time-based animations with smooth rendering
- **Turtle Graphics**: Logo-inspired pattern generation
- **Text Measurement**: Typography utilities and text metrics
- **Box-Arrow**: Interactive diagram animations
- **Binary Search Tree**: Educational data structure visualization

Visit the demos at `/demo/index.html` when running the development server.

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please ensure your code:

- Follows the existing TypeScript patterns
- Includes appropriate tests
- Passes linting with `npm run lint:fix`
- Maintains type safety with `npm run typecheck`