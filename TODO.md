# TODOs - keep this clean

- [x] Drawing routines like drawRect and drawCircle (and those that follow) will
      eventually be able to use complex styling information that is independent
      of the geometric specification.
  - [x] Please make a separate `DrawingStyle` interface that describes these
        things, such as `fill: boolean` and `color: Color`, and remove those
        values from what is currently in the input argument interface.
  - [x] You can also add `stroke: boolean`, `strokeThickness: number`,
        `strokeColor: Color` - all the params should be optional, though.
  - [x] Then allow drawing functions to take a union of the geometric items
        (topLeft, size) and style info. The function signature could be such as
        `drawRect(params: DrawRectParams & DrawingStyle)`

- [x] Geometric primitive types can support 2D and 3D. Initially we only care about 2D.
  - [x] `Pt` has x, y, and (optional) z numbers (please rework the Point type to be this)
  - [x] `Vec` has dx, dy, and (optional) dz numbers
  - [x] `Size`has same fields as Vec - only difference is the name, which is important
- [x] Drawing command API should be about meaningfully named object arguments:
  - [x] Since DrawingLayers are where drawing operations will be applied,
        these should be part of that object's public interface.
  - [x] `drawRect`
    - [x] `topLeft: Pt` specifies the top left location
    - [x] `size: Size` specifies the width/height
    - [x] optional `fill: boolean` and `color: Color` parameters
  - [x] `drawCircle`
    - [x] `center: Pt` specifies the center location
    - [x] `radius: number` specifies radius
    - [x] optional `fill: boolean` and `color: Color` parameters

## Completed Items

**2024-07-02: Semantic Drawing API Implementation**

- Implemented `Pt` interface replacing `Point` with optional z coordinate
- Added `Vec` interface for vectors with dx, dy, optional dz
- Added `DrawRectParams` and `DrawCircleParams` interfaces
- Implemented `drawRect()` and `drawCircle()` methods on DrawingLayer class
- Updated hello-world demo to showcase new semantic API
- Maintained backward compatibility with `Point` type alias
- All drawing operations now use clear, object-based arguments instead of positional parameters

**2024-07-02: Styling System with Intersection Types**

- Created `DrawingStyle` interface with comprehensive styling options (fill, stroke, colors, thickness)
- Separated geometric parameters from styling parameters for better organization
- Updated `drawRect()` and `drawCircle()` to use intersection types: `DrawRectParams & DrawingStyle`
- Implemented helper method `applyStyleAndDraw()` for consistent styling across drawing methods
- Added support for both fill and stroke operations simultaneously
- Updated demo to showcase stroke styling, thickness, and combined fill+stroke rendering
- Demonstrates TypeScript intersection types working seamlessly for API design
