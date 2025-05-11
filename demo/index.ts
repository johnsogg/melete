// this is the demo code and is what an end user would write

import "./style.css";
import { initMelete } from "@johnsogg/melete";

// Defaults are like this. Init an instance and draw it.
console.log("The actual window size is:");
console.log(window.innerWidth, window.innerHeight);
const melete = initMelete({
  initialWidth: window.innerWidth,
  initialHeight: window.innerHeight,
  resizePolicy: "fullScreen",
});
melete.drawCanvas();
