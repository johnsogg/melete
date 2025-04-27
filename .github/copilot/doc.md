# Melete Drawing Library

## Project Overview

Melete is a web-based drawing application using HTML canvas for drawing
capabilities.

## Code Conventions

- Use TypeScript for type safety
- Use ESLint for linting
- Use Prettier for consistent formatting
- Ensure your editor invokes linting and formatting on save
- Use Vite for building and bundling
- Prefer .ts files to .js files whenever reasonable

## Building

- The tsconfig.json and tsconfig-build.json should be the same, with these exceptions:
  - tsconfig-build only includes the lib directory, while tsconfig includes lib and src
