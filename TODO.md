# TODOs - keep this clean

- Support 3D (2025-07-02)
- [x] Much of the code in the box-and-arrow commit from July 3 could potentially be brought in to the library because we will need both math routines and graphics routines. There is quite a lot of repetitive code that is DRY-worthy so we can clean that up as well. (2025-07-04) See the box and arrow commit polish extended description below.
- [x] Update the debugging panel such that it is minimized by default, and uses a little bug emoji as its trigger (2025-07-02)
- [x] Support simple turtle drawing operations including `move`, `left`, `right` (2025-07-02)
- [x] We need to support matrix operations for turtle operations in 2D and 3D. Each turtle operation will entail one or more matrix operations that are applied together as a stack. It should be sufficient to use a 4x4 matrix to support all 2D and 3D operations. 2D operations can be simply use the same matrix as 3D, assuming z=0. (2025-07-02)
- [x] Need to fix the typescript errors in tests about missing `describe` and such functions. Probably just need to configure vitest or something. (2025-07-03)
- [x] Improve turtle command type safety by replacing `any` types with proper interfaces (2025-07-04)
- [x] Fix debug panel label visibility - labels were white on white background (2025-07-04)
- [x] Fix animation FPS to achieve 60fps instead of throttled low FPS (2025-07-04)
- [x] Interactive animation of a box-and-arrow diagram (2025-07-04) See section below
- [x] Fix ESLint TypeScript version compatibility warning (2025-07-04)

## Box and arrow commit polish (TODO)

Yesterday we added the feature described in the section below (Box and arrow
diagram animation (completed)). I am leaving the description there for your
benefit.

The code we wrote for that currently lives in the demo, but after reading it I
realize that it can be re-usable in a few ways. I have gone through the
box-arrow/index.ts file and marked each symbol with tags:

- @demo - keep the code where it is
- @boxarrow - please move this code into /lib/models/boxarrow
- @graphics - move into /lib/graphics
- @geom - move into /lib/geom

There is a README.md file in the three new destination directories with a brief
description.

There are additional opportunities to clean the code up, but for this first
task, let's just move the code over and update references so everything runs and
the tests pass.

## Box and arrow diagram animation (completed)

For this next demo, I would like to add features to the library to support
interactive animations of box-and-arrow diagrams that are commonly used in data
structure instruction. See SLIDE_DEMO.md for a full outline of the long-term
vision. We will take a first step towards that vision with this work item.

The demo will consist of three boxes labeled "A", "B", and "C", with the text
centered inside each vertically and horizontally. Each box will have
configurable data:

- Its position
- Its width and height
- Its label
- Its border color, thickness, and corner radius
- Its fill color
- Its text color
- Its font name, style, and size

Each box is logically connected to others with directed edges:

- A leads to B
- B leads to C
- C leads to A
- C leads to B (note that this is graphically a separate edge from B to C)

Each edge will be depicted graphically, which have the following properties:

- Its stroke thickness
- Its stroke color
- The arrowhead style: a V shape, or a triangle shape
- The arrowhead size (width and length)

An edge will be logically originate and terminate at the centers of the related
boxes. The visual part of the edge is only drawn in the region between the box
extents - so for example if the boxes had transparent fill styles, you would not
see a line "underneath" the box, because the edge line is only drawn outside of
the two boxes.

An arrowhead for an edge points in the direction from the starting node to the
ending node, and the tip of the arrowhead falls right on the outer bounder of
the terminating box.

The interactive aspect of this demo is as follows:

The boxes are initially positioned at a random location that is entirely
enclosed inside the drawing surface. When the user clicks on the surface, new
positions are picked at random, and the boxes move to their chosen locations
over time.

Animation movement is determined like this:

- `duration`: the target number of renders the animation will take to complete
- `easing`: an easing function (ease in, ease out, ease in/out, spring)

If the user clicks again while the animation is underway, new locations are
chosen, and a new animation begins immediately. Be sure to clean up and cancel
prior animation timers and state.

I encourage you to conform to the parts of the plan in SLIDE_DEMO.md that line
up with this effort, but only as long as they are in scope.
