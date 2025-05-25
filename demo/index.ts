// this is the demo code and is what an end user would write

import "./style.css";

import { Melete } from "@johnsogg/melete";

const melete = new Melete({
  domId: "charming",
});

const bg = melete.getDefaultLayer();

console.log("===== TURTLE DEBUGGING TEST =====");
console.log("Drawing a simple square with turtle:");

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

// // Draw another test with straight lines for comparison
// console.log("===== DIRECT LINE DRAWING TEST =====");
// const centerX = 400;
// const centerY = 300;
// const size = 100;

// bg.draw({
//   line: {
//     from: { x: centerX, y: centerY },
//     to: { x: centerX, y: centerY - size },
//   },
// });

// bg.draw({
//   line: {
//     from: { x: centerX, y: centerY - size },
//     to: { x: centerX + size, y: centerY - size },
//   },
// });

// bg.draw({
//   line: {
//     from: { x: centerX + size, y: centerY - size },
//     to: { x: centerX + size, y: centerY },
//   },
// });

// bg.draw({
//   line: {
//     from: { x: centerX + size, y: centerY },
//     to: { x: centerX, y: centerY },
//   },
// });

melete.draw();
