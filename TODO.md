# TODOs - keep this clean

- [x] Update remaining hello-world drawing operations with draw functions
  - The demo/hello-world/index.ts file has a few outstanding usages of the
    canvas API. Let's write abstractions for those:
  - [x] `clear` with some background color
  - [x] Replace `setFillColor` and `setFont` and any other future persistent
        style changes with `setStyle` that accepts a DrawingStyle implementation.
        Any defined properties on that object should set the value. Any `null`
        values should clear the value to whatever the default is.
  - [x] replace `fillText` with `drawText` (the 'fill' vs 'draw' has always
        bothered me - I understand the difference between filling and stroking but
        this confuses students)
  - [x] `drawLine` takes `from: Pt` and `to: Pt`

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

**2024-07-02: Complete Semantic Drawing API Implementation**

- Extended `DrawingStyle` interface with text styling properties: `font` and `textColor`
- Added `DrawTextParams` and `DrawLineParams` interfaces for semantic method parameters
- Implemented `layer.clear(color?)` method for background clearing with optional color
- Implemented `layer.setStyle(DrawingStyle)` for persistent styling state management
- Implemented `layer.drawText()` with intersection type: `DrawTextParams & DrawingStyle`
- Implemented `layer.drawLine()` with intersection type: `DrawLineParams & DrawingStyle`
- Updated hello-world demo to use complete semantic API, eliminating all raw Canvas calls
- Achieved educational goal: "drawText" vs "fillText" less confusing for students
- Completed transformation from Canvas wrapper to full semantic graphics API
