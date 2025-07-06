# TODOs - keep this clean

- Support 3D (2025-07-02)
- [x] Eliminate `any` types (Type Safety) (SUGGESTIONS.md) (2025-07-06)
- [x] Standardize graphics API patterns (Code Organization) (SUGGESTIONS.md) (2025-07-06)
- Add comprehensive error handling (Robustness) (SUGGESTIONS.md) (2025-07-06)
- [x] The lerp function found in demo/bst will be used commonly. We could have 1D, 2D, and 3D forms of it to support scalar ranges and also 2D point/vector and 3D point/vector variants. (2025-07-06)
- [x] Augment the BST demo to include (a) data structure code to delete nodes by data value, (b) the ability to click on a node to select it, (c) the ability to delete the selected node. Be sure to keep the data structure code separate from the interaction and visualization. (2025-07-06)
- [x] Implement comprehensive hit testing system for click detection and future collision detection. Support AABB pre-filtering with precise hit testing for all drawing primitives. Integrate at layer and surface level with proper z-order handling. (2025-07-06)
- [x] Support band-select in BST demo. The user should be able to drag in the canvas to form a rectangular selection. This should cause all nodes that intersect with the band-selected region to become selected. The user can then delete all those selected. For the BST mass-delete, you can simply delete each individual node. Be sure to control the "Delete" button state - it should be disabled if there are no selected nodes. Nodes that are deleted also should always become unselected. (2025-07-06)
