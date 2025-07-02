# TODOs - keep this clean

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
