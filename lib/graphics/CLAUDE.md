# Graphics

The graphics utilities in this directory are what is used to actually draw to HTML Canvas contexts.

## File structure

- `index.ts` should be used to re-export symbols that are expected to be used
  elsewhere. Do not export symbols that are only used in files in this
  directory.
- `types.ts` should only include types
- `drawing.ts` should include `drawFooPath` and `drawFooPathStyled` functions
- `animation.ts` should include animation-focused code

## Function conventions

- Two main types of function:
  - `drawFooPath` is for defining a geometric path with arguments:
    - `ctx: CanvasRenderingContext2D` to draw on
    - `beginPath: boolean` optional, defaults to false
    - Geometry appropriate for the operation in question
  - `drawFooStyled` uses applies stroke and fill operations to a geometric path.
    Typically uses `applyStyleAndDraw` with the corresponding `drawFooPath` used
    in the callback.
- Functions should typically take a single object argument with meaningful,
  consistently used names.
