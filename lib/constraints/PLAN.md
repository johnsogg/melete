# Constraint-based design

I'd like to lay some groundwork for building a new system based on 2D numeric
constraints.

Here are planned concepts:

- 2D points, which are just x,y locations
- Segments are defined by 2D geometry.
- Open segments are those that have distinct start and end points, and can
  include straight lines, circular arcs, Bezier curves, and so on. The exact
  list is not important for right now, but what _is_ important is that we have a
  concept of such open segments.
- Closed segments are closed 2D geometry such as circles, ellipses
- A Shape has an outer path defined by a closed segment, or a sequence of open
  segments that form a cycle.
- A shape is synonymous with a Part.
- Shapes can have zero or more holes (e.g. a round hole inside a rectangle).
  These are defined as inner paths.
- Shapes must have a reference point and direction to indicate where its
  coordinate axes are and how it is oriented. This is called a Pose. If the user
  says "place shape X at location P", what we're really doing is translating
  Shape X such that its Pose location is at P, and it is oriented with the
  direction facing up (or whatever our conventional alignment is. Probably up.)
- A shape can be part of an assembly, which fixes the relative locations of all
  of its parts.
- An assembly also has a pose.
- Not all geometry is visible. "Guide geometry" are 2D geometric entities like
  lines and circles that can be used to calculate locations of other points, but
  the guide geometry is not part of a shape's visible appearance. For example,
  we might have a guide line inside a rectangle that is 10 units from one
  particular edge, another that is 20 units from an adjacent edge, and the point
  where they intersect is the center of a circular hole with radius of 6 units.

A constraint is applied against points. Each constraint has an error function
that reports how much overall error that constraint has. The user will be able
to deform the geometry intentionally, and rely on a constraint solver to make
any necessary corrections to put the overall constraint system back into
near-zero error.

The constraint solver should pause while the user is actively manipulating
geometry.

A drawing will be composed of 2D geometry and 2D constraints. The user will be
able to create, modify, and delete any 2D geometry or any 2D constraints.

The constraint solver will be based on gradient descent of each constraint's
error function. This will operate iteratively, and (as I have discovered from my
PhD thesis that first implemented this) it is advantageous to also animate the
solving process. While it is possible to find a satisfactory solution very
quickly, users find it jarring when the drawing makes sudden, snapping motions.
By animating the solving progress (even if it is artificially slowed down) it
feels much more organic, and users can relate to it better.

As an example, consider the following geometry and constraints:

- We have a rectangle
- The long sides and the short sides have a ratio of rho (the golden mean)
- There are two circular holes inside the rectangle
- A guide line bisects the rectangle along its longer center line
- The circles are centered on the guide line
- The circles centers must be exactly 80 units apart
- The circles have a radius of 20 units
- The part is aligned with the edges of the drawing canvas

This is a simple textual description, but it should get the point across. The
user can drag points or edges around, and the constraint solver will kick in to
solve the overall system. The user can add new constraints, such as "the
distance from each circle edge to the rectangle edge must be the same".

It will be possible to over-constrain a system, either via unclear constraints
such as the one I just wrote, or by specifying an impossible system (such as
"make a triangle with three right angles"). If such an over-constrained system
is found, it should be possible to revert to a prior state, or for the
constraint solver to stop and wait for the user to fix the problem.

It is also possible (and desirable) to under-constrain a system. This is part of
what will give users the ability to "play" with the drawing, because there are
potentially infinite solutions to such an under-constrained system.

## Data structures

### Use lib/geom types

There are already a number of relevant types in lib/geom/types.ts: Pt, Vec,
LineSeg, and two Bezier curve types. I think we should add definitions for
individual segment types in addition to LineSeg, so we'll have CircleArcSeg as
well - there will be more but I don't want to do everything all at once.

For the time being, you should ignore all the DrawFooParams types in that file,
as they are not relevant.

The Ray type has what we need to define a Pose, but it has different semantics.
Please add a Pose type.

### Segment Sequences

To model sequences of segments, we will need another type that models sequences
of any of the Segment types. It will be important to be able to treat the
segments in the same way - they should all have a distinct start and end point,
for example, even if individual types might have other geometry as well (e.g.
cubic Bezier has two more points than a LineSeg). This might be as simple as
using a naming convention: `start: Pt`, `end: Pt`. If all segment types included
a `segType` field that must be one of the known types, we can leverage
Typescript's discriminated union concept.

Further, the start and end
points comprising a segment sequence must match up. E.g. the end point of
segment0 must be the same in-memory point as the start point of segment1.

### Shapes

A shape must have an outer boundary, which must be a closed segment or a segment
sequence that forms a cycle.

Shapes may also optionally contain inner shapes, which define holes.

Shapes must have a Pose, which defines the origin and orientation of all the
segments inside it. This will be used to position a shape and make it rotate the
way the user intends.

## Constraints

### Constraint definitions

A constraint is a function of one or more points. Those points might be shared
among geometric structures like segments, poses, or guides.

The initial set of constraints are:

- Point-on-line: maintain P1 to fall on line formed by P2 and P3
- Same length: maintain distance(P1, P2) to equal distance(P3, P4)
- Right angle: maintain angle(lineA, lineB) to be π/2 radians

We will add more constraints once we have a good understanding of what is
involved in building out these three.

### Constraint solver

The heart of this work is the constraint solver. It will be based on gradient
descent.

Each constraint has an error function reports a value that describes how 'wrong'
it is. We will also need to be able to get a partial derivative of an error
function for all the numbers that can vary.

We can not generally rely on having symbolic definitions for our constraints, so
I prefer that we use numerical differentiation everywhere.

## User interaction

The constraint solver will be used in interactive applications, so it is
important that it operate asynchronously. It should be able to be paused and
resumed.

We will also need to be able to capture information about the overall constraint
system to give the user feedback:

- How many constraints are there?
- What are those constraints and which points to they operate on?
- What is the current error value for the constraint?
- Iteration data:
  - when solving, what iteration is it currently on
  - when solving, how stable is progress?
  - when solving, how much residual error is there (with rolling statistics)
  - after solving, should answer the same questions as above, plus:
    - how many iterations did it solve
    - what is the final residual error?
    - was the system solvable or not?

## Generality

The constraint solver we are building is intended to be of general use, not just
for 2D geometry.

## Your Mission

The purpose here is to have a clear, unambiguous initial plan for using or
creating data structures, and to create a constraint solver based on gradient
descent.

If any part of this plan is not absolutely clear and unambiguous, we must not
proceed with coding until we have addressed the limitation.

You MUST ask clarifying questions if something is unclear or ambiguous.

## Questions, Answered

### Round 1

1. Pose Definition: What should Pose contain beyond Ray (position + orientation)?

A pose really is just a Ray, with a different name. The difference is semantic.
It makes sense to "cast a ray" but not a pose; it makes sense to "strike a pose"
but not a ray. Does that make sense? This really is more about having good type
names that help to provide documentation-as-code.

2. Segment Type System: Exact interface design for discriminated union with segType field?

I imagined something like this:

```ts
type SegmentNames = 'line' | 'circle-arc' | 'other';
type Segment = LineSeg | CircleArcSeg | OtherSeg;

type LineSeg = {
  segType: 'line';
  start: Pt;
  end: Pt;
};

type CircleArcSeg = {
  segType: 'circle-arc';
  start: Pt;
  control: Pt; // 3rd point on circle on the arc path between start and end
  end: Pt;
};

// now we can use the segType to resolve polymorphism
const someCode = (seg: Segment) => {
  switch (seg.segType) {
    case 'line':
      // do line things knowing that seg is a LineSeg
      break;
    case 'circle-arc':
      // do arc things knowing it is a CircleArcSeg
      break;
    // etc
  }
};
```

3. Shared Point References: How to manage point identity and sharing between segments?

One way is to use a hash table of IDs to Pt objects. Then our structures would
refer to points by ID, and we'd look them up when needed. This has drawbacks: it
isn't great for debugging, and there's also the overhead of working with a hash
table and potential for memory leaks caused by objects that aren't cleaned out
when we're done with them. It also means other data structures like LineSeg
can't be used as-is. The upside is that it becomes easier to centralize our
model data because point information is stored in a single place. If we did this I imagine we'd need to create "constraint" types: CPt, CLineSeg, etc.

Another way is to be careful with object references. So long as we do not copy
object instance data, and instead pass them objects around by reference, we
should be able to make it work. E.g:

```ts
const lineA: LineSeg = { start: ptA, end: ptB };
const lineB: LineSeg = { start: ptB, end: ptC }; // shared with lineA.end
```

4. Solver Parameters:

- Convergence tolerance for "near-zero error"?
- Numerical differentiation step size?
- Animation timing (iterations per second)?

All of these items should be configurable. Possibly good defaults:

- convergence tolerance: 1e-4
- numerical differentiation step size: 1e-6

For the animation timing, the solver should not concern itself with animations
per se. Instead, its execution rate should be parametric. We will write separate
code that renders and animates the geometric model.

5. Error Functions: Mathematical form for each constraint type?

I had imagined that a constraint would be a function of N points, so we'd have
2N variables. Each constraint type's error function depends on the nature of
what it models.

Point-on-line: error is the perpendicular distance from the point to any
non-degenerate line, or some large value if the line is degenerate.

Same-length: error is the difference in line lengths.

Right-angle constraint: error is the angular deviation from expected to actual, in radians.

I imagine many of these constraints will have small effect size just because they're measuring something like angles which have a closed range that is small compared to measuring distance like point-on-line, which is an open range. Therefore maybe we should have a scale factor for each constraint to make them more comparable.

6. Over/Under-Constrained Detection: How to identify and handle these cases?

We don't need to identify over-constrained systems before attempting to solve it. Instead, we simply make the attempt, and keep accounting data about progress. If the error function doesn't converge, we can try various methods to recover, like how much we scale each iteration's delta. If we've exhausted recovery techniques we can restore the original state and declare the system to be unsolvable.

7. User Interaction Flow: When exactly does solving pause/resume during manipulation?

The exact UX details will be determined later. You might imagine that they can
press a key to toggle the solver on or off. The solver needs to operate asynchronously to support this behavior. A single solve iteration can be synchronous because it should not be possible for it to monopolize the thread of execution.

8. Integration Strategy: New module vs extension of existing systems?

Let's revisit this in the next round. It depends on where we land with the object uniqueness (pass by id, pass by reference) problem.

### Round 2:

1. CircleArcSeg Representation: How do you want to uniquely specify which arc segment of a circle?

Good catch. I'd like to use the 3rd point to define which arc to use. E.g. using
the line from start to end, the control point will either be to the left or to
the right. The control point appears _on_ the circular arc, so instead of simply
defining an abstract circle, it does that _and_ specifies which of the two arcs
is specified.

2. Point Reference Strategy: Object references or ID-based lookup? This affects the entire architecture.

I wanted to get your take on the two approaches. I prefer the second approach of
using object references carefully, because that is how I implemented this the
first time (in Java, fifteen years ago).

3. Integration with Existing Types: Do we modify lib/geom/types.ts or create new
   constraint-specific types?

I think it might be easier in the long-run to re-use the types in
lib/geom/types.ts. Let's do that, rather than creating constraint-specific
types. We can always use internal types (e.g. for the flattened vector etc) if
that is more efficient and maintainable.

4. Error Function Normalization: Should we normalize error functions or use your
   proposed scale factors?

I like your bounded error range idea - keep error in the range [0, 1]. This way
it is essentially a ratio. I will need help setting this up. The trick is to determine a good denominator, and prevent out-of-range issues. e.g:

```ts
// keep error in range [0, 1] - don't take this as implementation advice,
// I am just illustrating what I'm thinking.
const error = abs(min(current_error, max_error) / max_error);
```

### Round 3

1. Error Function Max Values: What should max_expected_error be for each
   constraint type?
   - Point-on-line: Maybe canvas diagonal length?
   - Same-length: Maybe max of the two lengths being compared?
   - Right-angle: π/2 radians (90 degrees)?

Yes to all of these. I like the canvas diagonal length idea, though we might
need to modify that if the user has a zoom set up or similar. This suggests to
me that constraint types might need support runtime parameterization of the
max_expected_error, if it involves mutable runtime information. For now, let's
let this be a parameter so we can change it.

2. CircleArcSeg Validation: Should we validate that the control point actually
   lies on the circle defined by start/end points?

I don't think I understand the question. Given three non-coincident points, they by definition are all on the circle that includes each of them.

3. Constraint Module Structure: Confirm the module organization:
   lib/constraints/
   ├── index.ts # Public API
   ├── types.ts # Core constraint types
   ├── constraints.ts # Individual constraint implementations
   ├── solver.ts # Gradient descent solver
   └── geometry.ts # Shapes, assemblies, segment sequences

Instead of constraints.ts, how about a directory, `constraints/` that includes
nicely named files like `pointOnLine.ts` or `sameLength.ts`.
