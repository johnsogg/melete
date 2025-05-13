// this is the demo code and is what an end user would write

import "./style.css";
import { drawMeleteFrame, initMelete } from "@johnsogg/melete";

const melete = initMelete({
  initialWidth: window.innerWidth,
  initialHeight: window.innerHeight,
  resizePolicy: "fullScreen",
  model: "",
});
drawMeleteFrame(melete);
