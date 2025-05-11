// this is the demo code and is what an end user would write

import "./style.css";
import { initMelete } from "@johnsogg/melete";

// Defaults are like this. Init an instance and draw it.
const melete = initMelete({
  initialWidth: 300,
  initialHeight: 300,
  resizePolicy: "static",
});
melete.drawCanvas();

// You can also customize which div the canvas is placed into, what it is called
// and how it is sized. Sizing is funky! See notes below.
const gonz = initMelete({
  canvasId: "gonzoCanvas",
  canvasParentSelector: "#gonzo",
  initialWidth: 100, // initial size within the dom. block elements can stretch wide
  initialHeight: 300, // also init size, but block elms do NOT stretch height!
  // style: "width: 100%;", // this is immediately applied to canvas
  resizePolicy: "static",
});
gonz.geometry.push({
  start: { x: 10, y: 10 },
  end: { x: 100, y: 50 },
});
gonz.drawCanvas();
