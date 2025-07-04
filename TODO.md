# TODOs - keep this clean

- Support 3D (2025-07-02)
- [x] Update the debugging panel such that it is minimized by default, and uses a little bug emoji as its trigger (2025-07-02)
- [x] Support simple turtle drawing operations including `move`, `left`, `right` (2025-07-02)
- [x] We need to support matrix operations for turtle operations in 2D and 3D. Each turtle operation will entail one or more matrix operations that are applied together as a stack. It should be sufficient to use a 4x4 matrix to support all 2D and 3D operations. 2D operations can be simply use the same matrix as 3D, assuming z=0. (2025-07-02)
- [x] Need to fix the typescript errors in tests about missing `describe` and such functions. Probably just need to configure vitest or something. (2025-07-03)
- [x] Improve turtle command type safety by replacing `any` types with proper interfaces (2025-07-04)
- [x] Fix debug panel label visibility - labels were white on white background (2025-07-04)
- [x] Fix animation FPS to achieve 60fps instead of throttled low FPS (2025-07-04)
