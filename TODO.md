# TODOs - keep this clean

- [x] Debug widget. See our convo about it here:

> I love the debug information thing! I imagine that will become a thing on every demo page.

⏺ That's a great idea! The debug information panel is really useful for demonstrating how the library works internally. It shows:

- Click coordinates with timestamps - great for understanding event handling
- Model state - shows how the data-driven rendering works
- Visual feedback - makes it obvious when interactions are working

This would be perfect to standardize across all demos. We could create a reusable debug panel component that shows:

- Current model state (formatted nicely)
- Recent events (clicks, key presses, etc.)
- Performance info (render times, FPS)
- Canvas state (dimensions, element info)
- Layer information

It would help users understand:

1. How model-driven rendering works - see the model change in real-time
2. Event system - see exactly where clicks are registered
3. Performance characteristics - understand rendering behavior
4. Debugging their own code - template for adding debugging to their projects

Plus it makes the demos much more educational and interactive. When you're teaching graphics programming, being able to see the internal state makes everything
clearer.

Would you like me to create a reusable debug panel component that could be easily added to future demos? It could be as simple as a function that creates the
debug UI and hooks into the DrawingSurface events.

- [ ] Create a new demo that focuses on layers. This will involve implementing new features:
  - [ ] DrawingSurface can be constructed with several named layers
  - [ ] Each layer will have their own drawing routines in the demo:
    - [ ] Background: empty space with some small dots for stars
    - [ ] Space Ship: centered on screen, made from rectangle and circles. it can look dumb
    - [ ] Asteroids: two large gray circles flanking the ship
  - [ ] For now, each layer is static
