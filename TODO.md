# TODOs - keep this clean

- [x] Add the ability to animate images as a function of time
  - [x] Layers (in their schema) can be configured with `animated: boolean`. By
        default this is false.
  - [x] The drawing surface constructor should take an `animationRate: number`.
        The default value is 60. Since this is the most common value most users
        will not need to bother, but include it just in case.
  - [x] If a layer is animated they will be redrawn frequently, and the info
        passed in to the `onTick` function involves the current frame number as
        the `tick` value
  - [x] If any layer in the surface is animated, the surface will use a
        repeating timer to render the layers. Layers that are not animated will
        eventually (not now) need to have a cached version of their image.
  - [x] Create a new demo called animation that is just like the layers demo
        with the spaceship and asteroids. In the animation demo the stars
        twinkle as a function of time, and the asteroids move around. No need
        to collision detect as that is not the point of the demo.

- [ ] Support cached images for non-animated layers
  - [ ] This should be done with an OffscreenCanvas so it does not affect any
        other layer
  - [ ] After completing drawing operations against the offscreen canvas, store
        an image using main memory - do not use GPU memory for this!
  - [ ] On subsequent draws, draw the cached image instead of using the normal
        drawing routine.

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
