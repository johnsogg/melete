# Melete TODOs

## 5/26/25

✅ Working on pen styles. Want surface.pushPen() and surface.popPen()
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

  - ✅ Named locations
      - ✅ Need to be able to store a named location
      - ✅ Need to be able to retrieve and use a named location (e.g. turtle 'face location X')
  - [ ] Image Buffers
      - [ ] Be able to store an offscreen buffer to an image by name
      - [ ] Have a way of knowing to use an offscreen image buffer
      - [ ] When called for, be able to draw that image buffer
  - [ ] Animation
      - [ ] Should be able to animate individual drawing surfaces:
          - [ ] At a fixed rate (e.g. 60 hz)
	  - [ ] Have each animation schedule the next round, capped at some amount like 60 hz.
      - [ ] 