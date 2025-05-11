# Melete Planning Doc

I want Melete to be a powerful learning platform for programming. It is a
non-goal for it to be simple and approachable in the way that (say) p5.js is.

## Design Philosophy

When an object-oriented system uses data encapsulation, it hides the existence
of certain fields from the programmer. This is often a good trade because those
fields were besides the point: the programmer wanted to draw a circle, not do
trigonometry. The data lies behind the useful abstraction and lets the
programmer express their intention while not needing to know many (or any)
details.

But taken to an extreme, this robs the programmer of opportunities to understand
how things really work. There truly is value in re-inventing the wheel. By
implementing a pattern that is used elsewhere, the programmer not only gains
awareness and appreciation for how that particular thing works, but also gains
the opportunity to analogize that pattern in the future when they encounter a
similar but unsolved problem.

Melete is named after the Muse of Practice. One does master a medium by
parachuting onto the shoulders of giants, but by retracing their steps and
questioning their decisions. This library encourages building knowledge through
practice.

## Mental Model

This is a drawing library. It works in Javascript (or Typescript, if preferred)
in a web browser or Node environment, and lets the user make anything from
static diagrams to interactive art and games. It abstracts the Canvas API.

We have a number of concepts to build with:

- Drawing layers
- Pen and camera settings
- Planning geometry (more on this later)
- Passage of time
- Interactivity (user input)
- Math
- Data structures (user-defined and from libraries)

A Melete scene could be a single static picture, drawn to a single buffer one
time, and then rendered. Or it could be several layers: one is static as just
mentioned, another interactively lets users draw onto it which re-renders only
when needed, and another animates a data visualization that re-renders on a
fixed timer.

The highest level graphical idea is the canvas. This is the rectangular block
that is apparent to users. It can be composed of several drawing layers.

Drawing layers provide a way to place pixels using primitive operations such as
drawing circles, rectangles, lines, images, and so on. The programmer can change
drawing settings (which we call pen operations) and control the camera.

A drawing layer is given information about user activity, the clock, and any
model-based data structures the programmer has established. The layer can be
rendered once, on demand, or on a timer. Completed layers can be re-drawn from a
cache without needed to re-compute all the same pixels as the last time, so
there are opportunities for efficiency boosts.

Programmers can compute geometry that isn't directly drawn to the screen, but is
instead used to guide production. For example, a machinist works from a drawing
that includes guide lines to indicate what is parallel to what, points of
interest and the distances between them, and other annotations. Those geometric
forms are not part of the final piece but are used to build it. Melete uses a
similar concept: a guide pen can use the same drawing operations as pixel
operations, but instead of rendering graphics, it renders abstract geometry.
That geometry (points, distances, directions, etc) can then be used to more
easily render subsequent graphics.

When a drawing layer renders, it has access to environmental information that
includes any user interaction (mouse pressed, key typed, etc), clock information
(current wall clock, frame number, frame delta since last render, etc), and
model data that encodes whatever the canvas is intended to show (spaceship, data
visualization, etc). Some of this is read only and some can be mutated and
available to subsequent drawing operations globally.
