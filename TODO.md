# Melete TODOs

## 5/26/25

DONE Working on pen styles. Want surface.pushPen() and surface.popPen()
(maybe penPush and penPop?). These can be pen operations that when
'drawn' affect the current graphic style of the render context, if
there is one.

-- I ended up simply using setPen(p). The stack idea is nice but the
drawing surface doesn't have that concept. Not now, at least. I
could add it.

- Next, I have a bunch of aspirational stuff like named locations and
  image buffers. Also the whole thing only draws once, nothing is
  animated yet so I need to bring those things in. The drawing
  routines seem straightforward so I don't think that's the next thing
  to do. Also, the camera transforms will be important. Punchlist
  based on that:

- DONE Named locations
    - DONE Need to be able to store a named location
    - DONE Need to be able to retrieve and use a named location (e.g. turtle 'face location X')
- DONE Image Buffers
    - DONE Be able to store an offscreen buffer to an image by name
    - DONE Have a way of knowing to use an offscreen image buffer
    - DONE When called for, be able to draw that image buffer
- DONE Animation
    - DONE Should be able to animate individual drawing surfaces:
        - DONE At a fixed rate (e.g. 60 hertz)
        - DONE If a surface doesn't require animation it should:
            - DONE Save its pixels when it finishes drawing
            - DONE Draw those pixels next time

## 6/9/25

- TODO: Mouse Input
    - DONE: let end user add mouse handlers
    - TODO: mouse actions should be available in draw operations
    - TODO: make an object be drawn at the most recent click
