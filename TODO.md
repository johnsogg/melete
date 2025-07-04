# TODOs - keep this clean

- Support 3D (2025-07-02)
- ✅ Regroup type definitions. We currently have lib/types.ts with a few things, some of which should go in lib/geom. We also have graphic-oriented types there that should go in lib/graphics. And there's a random typedef for Point = Pt which shouldn't be there - we should only use Pt. The interfaces that start with "Draw" (e.g. DrawCircleParams) might better be thought of as geometric interfaces, e.g. the DrawCircleParams interface defines a center and a radius, which transcends drawing, because those properties are one possible definition of a circle. (2025-07-04)
- Need utilities for measuring text, such as "what is the expected bounding box for rendering string S with font F at location L" (2025-07-04)
- The DrawingLayer class contains methods that could make use of functions in both the graphics and geom directories. Graphics is for drawing things, and geom is for calculating things. I think the DrawingLayer class should be simplified so that it is responsible for maintaining its state and deferring to utility functions when possible. This will lead to better code reuse and simplify the DrawingLayer implementation. (2025-07-04)

## Completed (2025-07-04)

- ✅ Added vector utility functions (midpoint, direction, perpendicular, magnitude, normalize)
- ✅ Refactored geom/index.ts to use utility functions throughout
- ✅ Refactored graphics/index.ts drawArrowhead to use vector utilities instead of manual trigonometry
- ✅ Refactored box-arrow demo to use utility functions for all vector operations
- ✅ Cleaned up repetitive vector math calculations across the codebase
