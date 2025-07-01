# Demo Directory Memory

This file provides guidance to Claude Code when working with demos in the Melete graphics library.

## Demo Structure

- `/demo/index.html` - Main demo index page listing all available demos
- `/demo/hello-world/` - First demo showing basic canvas operations
- Each demo should be in its own subdirectory with `index.html` and `index.ts`

## Demo Guidelines

- Demos should showcase specific library features or use cases
- Keep demos focused on one main concept or feature set
- Include navigation back to the main demo index
- Use consistent styling across all demos:
  - Use the "Fanwood Text" font

## Current Demos

1. **Hello World** (`/hello-world/`) - Basic canvas setup, shapes, colors, and text rendering

## Demo Development Process

When adding new demos:

1. Create new subdirectory under `/demo/`
2. Add `index.html` with descriptive content and canvas element
3. Add `index.ts` importing from `../../lib/index`
4. Update main `/demo/index.html` to include the new demo in the list
5. Test the demo works in the development server

## Technical Notes

- Demos import library code from `../../lib/index`
- Canvas elements should have meaningful IDs
- Use TypeScript for demo logic
- Follow the established styling patterns for consistency
