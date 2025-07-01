# Melete Planning Document

The Melete library is for creating graphics with code. It is written in
Typescript and aims to have as few external runtime dependencies as possible.

**Important Note!** This document describes a long-term vision and might not
reflect the current state of the code.

## High Level Repo Organization

- `lib/` holds the library itself
- `demo/` holds an index of various example directories

## Purpose

The purpose of the library is to support programmatic interactive graphics for
instructional purposes. It could be used in various contexts, such as:

- Interactive tools for technical topics like programming, physics, and math
- Lecture slides
- Interactive art

## Development Flow

The library itself will provide its own support for math, graphics, and user
interaction. Automated tests will help ensure that the code works as expected.
We generally favor integration tests over unit tests. Unit tests are still nice
for tricky pure functions.

At all points, the demo code should also be kept in a working state, though this
can be a manual process. If manual testing shows that a demo is in a failing
state, the index file should be updated to note its status.

## TODOs

The @TODO.md file will hold upcoming features, often broken into parts. It will
also capture bug reports and hygiene improvements for tooling and code
structure.

## Library Features and Design Principles

This API will rely on standard web technologies such as the HTML Canvas API.

An image is rendered with a `DrawingSurface`, which itself is composed of one or
more `DrawingLayers`. Each layer can retain its own pen state, image cache, and
animation controls.

Users will create drawing surfaces by stating constraints such as a fixed size,
or to allow the enclosing context to set its size (e.g. window width). Each
surface can have multiple layers, and the programmer is responsible for
providing the drawing code. The drawing code will be invoked with a set of
objects: the drawing surface, the layer, environmental information such as the
current frame number, input events that have been performed since the last
render, model information, and so on.

Here is a list of design principles for this library:

1. **Function-oriented** - Many, if not most drawing libraries are
   object-oriented, relying on both internal object state as well as method
   arguments. Melete will instead rely mostly on functions that operate on its
   arguments. Classes and objects are still perfectly fine and in many cases
   will be the natural solution (e.g DrawingSurface and DrawingLayer). However,
   most objects can be of the plain variety (not build from classes) with static
   typing.
2. **Function arguments are objects** - In HTML Canvas, functions typically take
   positional, numerical arguments. For example: `fillRect(130, 190, 40, 60)`
   takes four numbers, and it is not obvious what those four numbers mean.
   Melete functions will instead take more semantically obvious arguments,
   relying heavily on object destructuring. For example, some possible way to
   rewrite the above might be:
   - `fillRect({ topLeft, width, height})`
   - `fillRect({ center, size })`
   - `fillRect({ topLeft, bottomRight})`

3. **Cache when appropriate** - many renders will repeatedly draw the same
   complex scene. In such cases it can be appropriate to cache results in an
   offscreen buffer to use again later.

4. **Layers** will let developers more easily group related graphics operations:
   debug layers, object outline layers, static background layers (good for
   cacheing), and more. A final image can be composed of many layers, each of
   which have their own cache policies.

5. **Pen State** - the library will support pen objects that group together
   graphical styles (stroke and fill colors, line weights, etc). These can be
   computed, stored, and applied as a group. This should work harmoniously with
   the underlying HTML Canvas API.

6. **Animations** can be invoked via timer (e.g. an object that cycles through
   color purely as a function of time) or via even (e.g. it starts and stops
   pulsing when the mouse is clicked). Animations are based on layers of an
   overall drawing surface.

7. **Models** - A drawing surface can have a model, which holds data about how
   to draw the picture. For example, a House model might specify a width and
   height, roof height, and number of windows. If the model changes over time
   (e.g. via user interaction) then it will potentially render differently. The
   drawing surfaces that render a model can determine which layers need to be
   re-rendered as appropriate.

8. **Turtle Graphics** are a special type of drawing operation that accepts a
   sequence of "turtle operations". For example:

   ```js
   turtle([
     { penState: 'up' }, // lift pen - no drawing, but we can move!
     { forward: 10 }, // move forward in current direction 10 units
     { leftDegrees: n / 180 }, // turn left some amount based on n
     { pen: myFancyStyle, penState: 'down' }, // set pen style and start drawing
     { forward: sideLength }, // move forward and draw a line of this length
     { namePoint: 'lip corner' }, // assign a name to the location turtle is at
     { leftDegrees: n / 180 }, // turn left again
     { forward: sideLength }, // draw another line
     { facePoint: 'lip corner' }, // rotate so named point is in front of turtle
   ]);
   ```

   Sequences of turtle operations can be computed via functions, or typed
   directly as I have just done. When executed, the sequence of commands will
   correspond to a sequence of HTML Canvas operations. The above example is not
   meant to be an exhaustive example of turtle operations, but rather to
   illustrate how it can be used as a compound operation. To do this, the layer
   will need to maintain a "turtle matrix transform" that describes the turtle's
   position and heading. Geometric operations like moving and rotating would
   push additional matrices onto a stack.

9. The planned architecture is to use an HTML Canvas to draw the final image. A
   drawing surface will be associated with such a canvas. Individual layers can
   use their own offscreen buffers (using OffscreenCanvas), with the final
   result being an ordered composite of the layers.

## Primary Objects

A `DrawingSurface` will be a class with a type parameter for the model. The
drawing surface will create a canvas in the DOM when it is built, which will be
used for the lifetime of the surface.

Drawing surfaces are constructed with an object that specifies the model and
layer schema. The layer schema defines both the layer names (ensuring type
safety) and their default configurations:

```ts
// Layer schema definition - establishes names, ordering, and default config
const SHIP_LAYERS = {
  engine: { cache: true, offscreen: true },
  body: { cache: true, offscreen: false },
} as const;

const ship = new DrawingSurface({
  model: spaceship,
  layerSchema: SHIP_LAYERS,
});

// Now layer access is type-safe and follows the defined order
const engineGlow = ship.getLayer('engine'); // ✓ Valid, gets layer with cache+offscreen
engineGlow.onTick(({ model, tick }) => {
  // callback invoked on every frame
  // ellipse size is a function of frame number
  drawEllipse({
    center: model.engine,
    size: multiplyVector(model.size, 30 + (tick % 120)),
  });
});

const body = ship.getLayer('body'); // ✓ Valid, gets layer with cache only
body.onRender(({ model }) => drawShipBody(model)); // invoked on first draw
```

Drawing operations like drawing lines, circles, text and turtle sequences are
only applied to layers. A `DrawingLayer` might need to be drawn on every frame,
or when something in the model changes, or upon a user input event.

In this example, the drawing surface is used to draw a space ship with a glowing
engine effect that depends on time, and a ship body that will be the same each
time. When the canvas must be drawn to the screen, the engine must be drawn each
time, but the body can be drawn once, and its cached version used subsequently.
The order of the layers determines how they draw and is established by the
object key order in the layer schema: engines first, then the ship body on top.

Layer configurations can be overridden at runtime if needed:

```ts
// Override default config for specific use case
const debugLayer = ship
  .getLayer('engine')
  .withConfig({ offscreen: false, cache: false });
```

## Input System

The `DrawingSurface` class will be responsible for receiving user input via
mouse, touch, and keyboard events. This will be done by simply registering event
handlers, which in turn are responsible for re-rendering if needed:

```ts
// silly program that shows a spaceship. it turns the cockpit lights on and
// off when clicked.
const SHIP_LAYERS = {
  main: { cache: true, offscreen: false },
} as const;

const ship = new DrawingSurface({
  model: myship,
  layerSchema: SHIP_LAYERS,
});

const layer = ship.getLayer('main');
// onDemand callback is used when the surface is asked to re-render
layer.onDemand(({ model }) => drawShip({ model }));
// add a mouse event handler on the drawing surface to respond to clicks
ship.onClick(ev => {
  model.lightsOn = !model.lightsOn; // toggle model state
  ship.rerender(); // request re-render (on demand) next frame
});
```

When the programmer adds a callback to a drawing surface, the surface will
ensure that the appropriate event is listened to and will be routed to the
handler:

```ts
// NOTE: this is a sketch, not a formal decision
interface MeleteMouseEvent {
  canvasX: number;
  canvasY: number;
  button: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  rawEvent: MouseEvent;
}

const createMeleteMouseEvent = (
  rawEvent: MouseEvent,
  canvas: HTMLCanvasElement
): MeleteMouseEvent => {
  const rect = canvas.getBoundingClientRect();

  return {
    canvasX: rawEvent.clientX - rect.left,
    canvasY: rawEvent.clientY - rect.top,
    button: rawEvent.button,
    shiftKey: rawEvent.shiftKey,
    ctrlKey: rawEvent.ctrlKey,
    altKey: rawEvent.altKey,
    metaKey: rawEvent.metaKey,
    rawEvent,
  };
};

class DrawingSurface {
  private canvas: HTMLCanvasElement;
  private clickHandlers: Array<(ev: MouseEvent) => void> = [];
  // all other event types get their own queues
  private keyHandlers: Array<(ev: KeyboardEvent) => void> = [];

  onClick(handler: (ev: MouseEvent) => void): void {
    // Add handler to our list
    this.clickHandlers.push(handler);

    // Only register DOM listener if this is the first handler
    if (this.clickHandlers.length === 1) {
      this.canvas.addEventListener('click', this.handleClick.bind(this));
    }
  }

  private handleClick(ev: MouseEvent): void {
    // transform into our MeleteEvent type and give it to all handlers
    const transformedEvent = createMeleteMouseEvent(ev, canvas);
    this.clickHandlers.forEach(handler => handler(transformedEvent));
  }
}
```
