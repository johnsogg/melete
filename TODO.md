# TODOs - keep this clean

- [x] Create a new demo that focuses on layers. This will involve implementing new features:
  - [x] DrawingSurface can be constructed with several named layers
  - [x] Each layer will have their own drawing routines in the demo:
    - [x] Background: empty space with some small dots for stars
    - [x] Space Ship: centered on screen, made from rectangle and circles. it can look dumb
    - [x] Asteroids: two large gray circles flanking the ship
  - [x] For now, each layer is static

- [x] Add layer information to the debug panel:
  - [x] To DrawingSurface, add a `setLayerVisible({name: string, visible: boolean})` method
  - [x] Show the drawing order of the layers and their names
  - [x] Put a checkbox next to each layer name to toggle visibility using the above function
