# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Melete is a TypeScript graphics library for creating web-based visual content including:
- Procedurally generated art
- Interactive lecture slides for math, computer science, and graphics
- Educational visualizations and diagrams
- Creative coding projects

The library aims to make complex graphics programming accessible while maintaining flexibility for advanced use cases.

## Core Technical Goals

- **Turtle Graphics**: Primary drawing paradigm inspired by Logo, providing intuitive geometric drawing
- **Web-First**: Built for modern browsers with canvas-based rendering
- **Procedural Focus**: Designed to support algorithmic and generative graphics
- **Educational Use**: Simple API suitable for teaching programming and mathematics concepts

## Technology Stack

- **TypeScript**: Primary language for type safety and developer experience
- **Vite**: Build tool and development server
- **Canvas API**: Core rendering technology
- **ES Modules**: Modern module system

## Development Commands

```bash
# Development server
npm run dev

# Build library
npm run build

# Run linting
npm run lint:fix

# Run tests
npm run test
```

## Project Status

This is a fresh start - the project was recently reset while preserving git history. All implementation details will be developed collaboratively from scratch, though the core vision and tech stack remain consistent with the original concept.

## Memories

- Refer to PLANNING.md for long term thinking
- Refer to TODO.md for checklists of current feature ideas, bugs, and tooling fixes
- Before finishing a task, execute `npm run lint:fix` to automatically fix formatting issues