# TODOs - keep this clean

- Support 3D (2025-07-02)
- In DrawingLayer, add method signatures for the missing drawing routines in lib/graphics. For example, DrawingLayer supports drawRect but not drawRoundedRect, but it should. The DrawingLayer class provides the primary point of end-user interaction, so it is important to expose the available drawing routines here. Importantly, the DrawingLayer methods will insert the drawing context, which the user won't have and shouldn't need. (2025-01-05)
