// this is the demo code and is what an end user would write. it runs in a
// browser context.

import "./style.css";

import { debugMouseEvent } from "~/tools/debugMouseEvent";

import { Melete } from "../lib"; // Adjusted import path

const config = {
    turtleTest: true,
    randomLines: true,
    lineAsterisk: true,
    namedLocationsTest: true,
    imageBufferTest: true,
    animationTest: true,
    layerTest: true,
    mouseClickTest: true,
    mouseClickRespondTest: true,
};

const melete = new Melete({
    domId: "charming",
    resizePolicy: "fullscreen",
});

const bg = melete.getDefaultLayer();

if (config.turtleTest) {
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
}

// A bunch of random lines with coordinates in the range 0..400
function randomCoord() {
    return Math.floor(Math.random() * 401);
}

// function to make a random hsl color that is pretty light
function randomLightColor() {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 50) + 50; // Saturation between 50% and 100%
    const l = Math.floor(Math.random() * 50) + 50; // Lightness between 50% and 100%
    return `hsl(${h}, ${s}%, ${l}%)`;
}

if (config.randomLines) {
    // change the pen color
    bg.draw({
        pen: {
            stroke: "red",
            thickness: 2,
        },
    });
    for (let i = 0; i < 5; i++) {
        bg.draw({
            pen: {
                stroke: randomLightColor(),
            },
        });
        bg.draw({
            line: {
                from: { x: randomCoord(), y: randomCoord() },
                to: { x: randomCoord(), y: randomCoord() },
            },
        });
    }
}

// test of setPen

if (config.lineAsterisk) {
    // get the canvas center
    const canvas = melete.canvasSize;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const n = 15;
    const thingLen = 50;
    for (let i = 0; i < n; i++) {
        bg.setPen({
            thickness: i + 1,
            stroke: randomLightColor(),
        });
        bg.draw({
            line: {
                from: { x: centerX, y: centerY },
                to: {
                    x: centerX + thingLen * Math.cos((i / n) * 2 * Math.PI),
                    y: centerY + thingLen * Math.sin((i / n) * 2 * Math.PI),
                },
            },
        });
    }
}

if (config.namedLocationsTest) {
    bg.draw({
        turtles: [
            // Start by moving to initialize position
            { op: "turn", turn: 180 },
            { op: "move", move: 100 },
            { op: "turn", turn: -90 },
            { op: "move", move: 400 },
            { op: "turn", turn: 90 },
            { op: "move", move: 100 },
            // Draw a square (90 degree turns, equal length sides)
            { op: "turn", turn: -90 },
            { op: "move", move: 100 },
            { op: "name", name: "groovy" },
            { op: "turn", turn: -90 },
            { op: "move", move: 100 },
            { op: "turn", turn: -90 },
            { op: "move", move: 50 },
            { op: "face", face: "groovy" },
            { op: "move", move: 150 },
        ],
    });
}

if (config.imageBufferTest) {
    const canvas = melete.canvasSize;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    bg.saveImageBuffer({
        name: "kermit",
        topLeft: { x: centerX - 50, y: centerY - 50 },
        size: { width: 100, height: 100 },
    });
    for (let i = 0; i < 5; i++) {
        bg.draw({
            image: {
                name: "kermit",
                topLeft: { x: i * 100, y: 500 },
            },
        });
    }
}

if (config.animationTest) {
    bg.draw((tick) => {
        return {
            line: {
                from: { x: tick % 200, y: tick % 200 },
                to: { x: 100, y: 100 },
            },
        };
    });
}

if (config.layerTest) {
    const anim = melete.createLayer("layerTestAnimation", true);
    anim.setPen({
        stroke: "lightgreen",
        thickness: 8,
    });
    anim.draw((tick) => {
        return {
            line: {
                from: { x: tick % 200, y: 100 },
                to: { x: 100, y: tick % 200 },
            },
        };
    });
}

if (config.mouseClickTest) {
    melete.addMouseClickHandler((ev) => console.log(debugMouseEvent(ev)));
}

if (config.mouseClickRespondTest) {
    melete.addMouseClickHandler((ev) => {
        console.log(`Got mouse click at ${ev.x}, ${ev.y}`);
        bg.draw({
            pen: {
                stroke: "red",
                thickness: 2,
            },
            line: {
                // from 0,0 to mouse click location
                from: { x: 0, y: 0 },
                to: { x: ev.x, y: ev.y },
            },
        });
    });
}

melete.animate();
