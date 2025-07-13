# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Melete is a TypeScript graphics library for creating web-based visual content including:

- Procedurally generated art
- Interactive lecture slides for math, computer science, and graphics
- Educational visualizations and diagrams
- Creative coding projects

The library aims to make complex graphics programming accessible while maintaining flexibility for advanced use cases.

## Architecture Overview

### Core Systems

1. **Canvas Management** (`lib/canvas.ts`)
   - Low-level HTML5 Canvas wrapper
   - Context management and basic drawing operations
   - Foundation for all rendering operations

2. **Layer System** (`lib/layer.ts`, `lib/surface.ts`)
   - Composable drawing layers with individual caching
   - Animation support through tick-based rendering
   - Type-safe layer schema definition
   - Event handling for interactive applications

3. **Graphics Primitives** (`lib/graphics/`)
   - Dual API pattern: `drawFooPath()` and `drawFooStyled()` functions
   - Consistent styling system with `DrawingStyle` interface
   - Text measurement and typography utilities
   - Easing functions for animations

4. **Turtle Graphics** (`lib/turtle/`)
   - Logo-inspired drawing system with commands like `forward()`, `turn()`
   - Hierarchical state management with push/pop operations
   - Mathematical foundation with vector and matrix operations
   - Path generation and rendering pipeline

5. **Geometry** (`lib/geom/`)
   - Core geometric types: `Pt`, `Vec`, `Size`, etc.
   - Mathematical utilities for geometric calculations
   - Foundation for all spatial operations

6. **Models** (`lib/models/`)
   - Higher-level drawing abstractions
   - Currently includes box-arrow diagrams for data structures

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
│   ├── stack.ts          # State stack management
│   └── math/             # Mathematical utilities
├── geom/                 # Geometry utilities
│   ├── index.ts          # Geometry exports
│   └── types.ts          # Geometric type definitions
└── models/               # High-level models
    └── boxarrow/         # Box-and-arrow diagrams
```

### Demo Structure

```
demo/
├── index.html            # Main demo index page
├── index.ts              # Demo navigation logic
└── */                    # Individual demo subdirectories
    ├── index.html        # Demo HTML page
    └── index.ts          # Demo TypeScript logic
```

## Key Design Patterns

### Dual API Pattern (Graphics)

- `drawFooPath()`: Creates geometric paths without styling
- `drawFooStyled()`: Applies styling and renders paths
- Allows flexible composition and reuse

### Layer Composition

- Type-safe layer schemas with `LayerSchema` interface
- Automatic caching for static layers
- Animation support through tick-based callbacks
- Model-driven rendering with automatic cache invalidation

### Turtle Graphics

- Immutable command sequences
- Functional state transformations
- Hierarchical operations with push/pop semantics
- Path generation separate from rendering

## Technology Stack

- **TypeScript**: Primary language for type safety and developer experience
- **Vite**: Build tool and development server
- **Canvas API**: Core rendering technology
- **ES Modules**: Modern module system
- **Vitest**: Testing framework
- **ESLint + Prettier**: Code quality and formatting

## Development Commands

```bash
# Development server (serves demos)
npm run dev

# Build library for distribution
npm run build

# Run all checks (lint + typecheck + tests)
npm run check

# Run linting with auto-fix
npm run lint:fix

# Run tests and exit on completion
npm run test:run

# Type checking only
npm run typecheck
```

## Development Guidelines

### Code Style

- Use arrow functions whenever technically possible
- Prefer `const` over `let`, avoid `var`
- Use meaningful parameter object destructuring
- Follow existing naming conventions
- Maintain strict TypeScript settings

### Testing

- Write tests for all public APIs
- Use descriptive test names
- Test both happy path and edge cases
- Run `npm run check` before committing

### Graphics Functions

- Follow dual API pattern: path generation + styled rendering
- Use consistent parameter object patterns
- Include proper TypeScript types for all parameters
- Document complex geometric operations

### Layer Development

- Design layers to be composable and reusable
- Use caching appropriately for static content
- Separate model logic from rendering logic
- Implement proper cleanup in destroy methods

## Project Status

The library has a solid foundation with:

- ✅ Complete turtle graphics system with comprehensive tests
- ✅ Robust layer system with caching and animation
- ✅ Full suite of graphics primitives
- ✅ Text measurement and typography utilities
- ✅ Interactive demos showcasing all features
- ✅ Type-safe APIs throughout
- ✅ Educational models (box-arrow, BST)

## Memories and References

- Refer to PLANNING.md for long-term architectural thinking
- Refer to TODO.md for current feature ideas and bug fixes
- Check individual README files in subdirectories for specific guidance
- **For debugging running web apps:** Read `docs/chrome-debugging.md` for the complete Chrome debugging workflow
- Before finishing tasks, run `npm run lint:fix` for formatting
- Use `npm run check` to ensure all quality checks pass
- Follow the established patterns in existing code
