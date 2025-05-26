// this is the demo code and is what an end user would write

import "./style.css";
import { initMelete } from "@johnsogg/melete";

const melete = initMelete({
    initialWidth: window.innerWidth,
    initialHeight: window.innerHeight,
    resizePolicy: "fullScreen",
});

// An animation is all about drawing to a buffer over and over.
melete.addBuffer(); // TODO
melete.animate(60);
