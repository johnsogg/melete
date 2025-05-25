// In this first region we have misc definitions, I am just going for the API,
// not implementation just yet.

class Melete<T = void> {
  constructor(
    public readonly domId: string,
    public userModel?: T,
  ) {}

  getDefaultLayer(): DrawingSurface {
    return new DrawingSurface();
  }

  createLayer(_name: string): DrawingSurface {
    return new DrawingSurface();
  }
}

type Key = {
  // Represents a keyboard key. I am mega confused about how this has been
  // implemented in Javascript, with deprecated things all over the place, and
  // distinctions between key codes and key chars, etc. Punting.
  symbol: string;
};

const Keys = {
  // I really don't know if this is the way I want to do things.
  space: { symbol: " " },
};

type Pt = {
  x: number;
  y: number;
};

type Sequence = Array<Pt>;

type Vec = {
  // similar to Pt, except semantics are of deltas/offsets/distances
  dx: number;
  dy: number;
};

type Dir = {
  // exactly like Vec! but intended to be for magnitude = 1
  dx: number;
  dy: number;
};

type LineOp = {
  from: Pt;
  to: Pt;
};

type ImageBufferOp = {
  buffer: ImageBuffer;
  // position, size?
};

type PenOp = {
  stroke?: string;
  thickness?: number;
  fill?: string;
};

type TurtleOp =
  | { name: string }
  | { move: number | DrawFunc } // need to break up drawing surface so we can do read-only stuff as a separate data structure
  | { turn: number | RotationSpec }
  | { pushState: string }
  | { penState: "up" | "down" }
  | { popState: string }
  | { pen: PenOp }
  | { face: string };

type TurtleSequenceOp = Array<TurtleOp>;

type DrawOp = {
  name?: string;
  pen?: PenOp;
  line?: LineOp;
  turtles?: TurtleSequenceOp;
  geometry?: Array<DrawOp>;
  image?: ImageBufferOp;
};

type DrawFunc = (_drawingContext: DrawingSurface) => void;

type RotationSpec = {
  radians?: number;
  degrees?: number;
};

type CameraSpec = {
  zoom?: number;
  pan?: Vec;
  rotate?: number | RotationSpec;
};

type NamedLocation = {
  position: Pt;
  direction: Dir;
};

type EventHandlers = {
  mouseDown?: (pt: Pt) => void;
  mouseDragged?: (pt: Pt) => void;
  keyPressed?: (k: Key) => void;
};

type Size = {
  width: number;
  height: number;
};

type ImageBuffer = {
  data: number[];
  colorSpace: string;
  size: Size;
};

class DrawingSurface {
  // time
  tick: number = 0;
  previousTick: number = 0;

  // executing on geometry
  draw(_spec: DrawOp | DrawFunc): Record<string, NamedLocation> {
    return {};
  }
  redraw() {}
  plan(_spec: DrawOp | DrawFunc): Record<string, NamedLocation> {
    return {};
  }
  animate({ fps: _fps, draw: _draw }: { fps: number; draw: DrawFunc }) {}

  // image buffers
  saveImageBuffer(_name?: string): ImageBuffer {
    return {
      colorSpace: "rgb",
      data: [],
      size: { width: 0, height: 0 },
    };
  }
  findImageBuffer(_name: string): ImageBuffer | null {
    return null;
  }

  // input related
  events: EventHandlers = {};

  // camera related
  zoom(_factor: number) {}
  pan(_pan: Vec) {}
  rotate(_factor: number | RotationSpec) {}
  adjustCamera(_cameraSpec: CameraSpec) {}

  // pen related
  setPen(_pen: PenOp) {}

  // geometry related
  findNamedPoint(_name: string): Pt {
    return { x: 0, y: 0 };
  }
  getCurrentLocation(): Pt {
    return { x: 0, y: 0 };
  }
}

// everything in this region just make the examples read better - can be igored!
const pi = 3.14;
const makeCloud = (): DrawOp[] => {
  return [];
};
const someTrickyFunction = (_a: number, _b: number) => 0;
const distance = (_start: Pt, _end: Pt) => {
  return 0;
};
const makeWidgetTurtles = () => {
  return [] as TurtleSequenceOp;
};
const drawHole = (_spot: Pt): DrawOp[] => {
  return [];
};
const birdGeom = (_t: number): DrawOp[] => {
  return [];
};
const getLogo = (): DrawOp[] => {
  return [];
};
// --------------------------- below here is an actual usage example

const surface = new Melete<void>("#some-dom-id");
const bg = surface.getDefaultLayer();
// draw a line with a default color and thickness
bg.draw({
  line: {
    from: { x: 50, y: 100 },
    to: { x: 150, y: 100 },
  },
});
// get geometry for a cloud
const cloud = makeCloud();
// render the cloud with the given graphic style
bg.draw({
  pen: {
    stroke: "lightgray",
    thickness: 3,
    // support rgb hex in various formats: #rgb, #rrggbb, and alpha versions
    fill: "#eee",
  },
  geometry: cloud,
  name: "Happy little cloud", // for debugging
});
// control camera elements one at a time
bg.zoom(2.5);
bg.pan({ dx: 40, dy: 100 });
bg.rotate({ radians: pi / 2 });
// or all at once - this has a different effect due to matrix math
bg.adjustCamera({
  zoom: 2.5,
  pan: { dx: 40, dy: 100 },
  rotate: { degrees: 90 },
});
// set a pen style for subsequent draw operations
bg.setPen({
  stroke: "black",
  thickness: 5,
  fill: "none",
});
// differential geometry
bg.draw({
  turtles: [
    { name: "Starting Location" },
    { move: 30 },
    { turn: { radians: pi / 4 } },
    { move: 50 },
    { pushState: "some name" },
    { penState: "up" },
    // plain number interpreted as degrees
    { turn: 45 },
    { move: 50 },
    { penState: "down" },
    { move: 50 },
    // revert to state from pushState earlier
    { popState: "some name" },
    {
      pen: {
        thickness: 1,
        // should support different color models like hsl
        fill: "hsl(270, 50%, 40%)",
        // ... and web names
        stroke: "papayawhip",
      },
    },
    { move: someTrickyFunction(10, 20) },
    // turn to face named location
    { face: "Starting Location" },
    // value can be a function that uses the turtle's short term memory that
    // we can use to find named points, pen settings, current location, etc.
    {
      move: (surf: DrawingSurface) =>
        distance(
          surf.findNamedPoint("Starting Location"),
          surf.getCurrentLocation(),
        ),
    },
  ],
});
// you don't need to draw. You can also plan geometry in advance:
const widgetTurtles = makeWidgetTurtles();
// and then apply it against a drawing buffer, using its camera settings:
const widgetPlan = bg.plan({ turtles: widgetTurtles });
// and then use those results as guides to draw other things:
bg.draw({
  geometry: [
    ...drawHole(widgetPlan["hole1"].position),
    ...drawHole(widgetPlan["hole2"].position),
  ],
});

// you could maybe make another layer for interactivity:
const pad = surface.createLayer("Drawing Pad");
const strokes: Sequence[] = [];
const mouseHelper = {
  mouseDown: (pt: Pt) => {
    const stroke = [pt];
    strokes.push(stroke); // is it possible to return 'void | string'?
  },
  mouseDragged: (pt: Pt) => {
    strokes.at(-1)?.push(pt);
    pad.redraw();
  },
};
const keyHelper = {
  keyPressed: (k: Key) => {
    if (k === Keys.space) {
      strokes.length = 0;
      pad.redraw();
    }
  },
};
// it might be better to pass this in to the createLayer function instead.
pad.events = {
  ...mouseHelper,
  ...keyHelper,
};

// and maybe an animation
const ani = surface.createLayer("Birds");
ani.animate({
  fps: 60,
  draw: (surf: DrawingSurface) => {
    const t = surf.tick;
    const stage = t % 30; // in range [0..29]
    // draw a bird that flaps its wings as function of time
    const bird = birdGeom(stage);
    surf.draw({
      geometry: bird,
    });
  },
});

// can also cache a rendered layer's image and re-draw that if nothing needs to
// change. It only needs to draw (and save) the image once.
const logo = surface.createLayer("Logo");
logo.draw((surf: DrawingSurface) => {
  const buffer = surf.findImageBuffer("scratch");
  if (buffer != null) {
    surf.draw({ image: { buffer } });
  } else {
    surf.draw({
      geometry: getLogo(),
    });
    surf.saveImageBuffer("scratch");
  }
});
