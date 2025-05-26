// this is the demo code and is what an end user would write

import "./style.css";

import { Melete } from "@johnsogg/melete";

const melete = new Melete({
    domId: "charming",
    resizePolicy: "fullscreen",
});

const bg = melete.getDefaultLayer();

// Try to draw a simple square
bg.draw({
    turtles: [
        // Start by moving to initialize position
        { op: "turn", turn: 180 },
        { op: "move", move: 100 },
        // Draw a square (90 degree turns, equal length sides)
        { op: "turn", turn: -90 },
        { op: "move", move: 100 },
        { op: "turn", turn: -90 },
        { op: "move", move: 100 },
        { op: "turn", turn: -90 },
        { op: "move", move: 100 },
        // Return to original orientation
        { op: "turn", turn: 90 },
    ],
});

melete.draw();
