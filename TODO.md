# TODOs - keep this clean

- Support 3D (2025-07-02)
- Need utilities for measuring text, such as "what is the expected bounding box for rendering string S with font F at location L" (2025-07-04)
- [x] The DrawingLayer class contains methods that could make use of functions in both the graphics and geom directories. Graphics is for drawing things, and geom is for calculating things. I think the DrawingLayer class should be simplified so that it is responsible for maintaining its state and deferring to utility functions when possible. This will lead to better code reuse and simplify the DrawingLayer implementation. (2025-07-04)
