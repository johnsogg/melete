import {
    currentPosition,
    degreesToRadians,
    multiplyMatrices,
    rotationMatrix,
    transformDirection,
    transformPoint,
    translationMatrix,
} from "~/matrix";
import {
    Matrix,
    NamedLocation,
    RenderContext,
    RenderSupport,
    RotationSpec,
    TurtleSequenceOp,
} from "~/types";

export const drawTurtles = ({
    surf,
    ctx,
    namedLocations,
    geom: turtles,
}: RenderSupport<TurtleSequenceOp>) => {
    // Initialize a matrix for tracking turtle state
    let turtleXfm = { ...surf.xfm };
    let penDown = true;

    turtles.forEach((turtleOp) => {
        if (turtleOp.op === "name" && turtleOp.name) {
            handleNameOperation(turtleXfm, turtleOp.name, namedLocations);
        } else if (turtleOp.op === "move") {
            turtleXfm = handleMoveOperation({
                turtleXfm,
                distance: turtleOp.move,
                ctx,
                penDown,
            });
        } else if (turtleOp.op === "turn") {
            turtleXfm = handleTurnOperation(turtleXfm, turtleOp.turn);
        } else if (turtleOp.op === "penState") {
            penDown = handlePenStateOperation(turtleOp.penState);
        }
    });
};

const handleNameOperation = (
    turtleXfm: Matrix,
    name: string,
    namedLocations: Record<string, NamedLocation>
): void => {
    const position = currentPosition(turtleXfm);
    // In the standard basis, (0, -1) is "up", so we transform that vector
    const baseDir = { dx: 0, dy: -1 };
    const direction = transformDirection(turtleXfm, baseDir);

    namedLocations[name] = {
        position,
        direction,
    };
};

const handleMoveOperation = ({
    turtleXfm,
    distance,
    ctx,
    penDown,
}: {
    turtleXfm: Matrix;
    distance: number;
    ctx?: RenderContext;
    penDown: boolean;
}): Matrix => {
    const currentPos = currentPosition(turtleXfm);
    const forwardOffset = { x: 0, y: -distance };
    const newPos = transformPoint(turtleXfm, forwardOffset);

    if (ctx && penDown) {
        ctx.beginPath();
        ctx.moveTo(currentPos.x, currentPos.y);
        ctx.lineTo(newPos.x, newPos.y);
        ctx.stroke();
        ctx.closePath();
    }

    const translationMat = translationMatrix({
        dx: forwardOffset.x,
        dy: forwardOffset.y,
    });

    return multiplyMatrices(turtleXfm, translationMat);
};

const handleTurnOperation = (
    turtleXfm: Matrix,
    turn: number | RotationSpec
): Matrix => {
    let angleRadians = 0;

    if (typeof turn === "number") {
        // Assuming degrees for numeric input
        angleRadians = degreesToRadians(turn);
    } else if (turn) {
        if (turn.degrees !== undefined) {
            angleRadians = degreesToRadians(turn.degrees);
        } else if (turn.radians !== undefined) {
            angleRadians = turn.radians;
        }
    }

    const currentPos = currentPosition(turtleXfm);
    const rot = rotationMatrix(angleRadians);

    // For rotation to work correctly with existing transforms,
    // we need to:
    // 1. Translate to origin
    // 2. Apply rotation
    // 3. Translate back to current position
    const toOrigin = translationMatrix({
        dx: -currentPos.x,
        dy: -currentPos.y,
    });
    const fromOrigin = translationMatrix({
        dx: currentPos.x,
        dy: currentPos.y,
    });

    // Apply the transformations in the correct order (right to
    // left) First apply translation to origin
    const step1 = multiplyMatrices(toOrigin, turtleXfm);
    const step2 = multiplyMatrices(rot, step1);
    return multiplyMatrices(fromOrigin, step2);
};

const handlePenStateOperation = (penState: string): boolean => {
    return penState === "down";
};

/**
 * Draws a triangular cursor representing the turtle at its current position and direction.
 */
export const drawTurtleCursor = (turtleXfm: Matrix, ctx: RenderContext) => {
    // Get the current position from the matrix
    const position = currentPosition(turtleXfm);

    // Get the current direction vector (facing direction)
    const direction = transformDirection(turtleXfm, { dx: 0, dy: -1 });

    // Define the size of the turtle cursor
    const size = 30;

    // Calculate perpendicular vector for the triangle's base
    const perpendicular = { dx: -direction.dy, dy: direction.dx };

    // Define the three points of the triangle
    // The tip of the triangle should point in the direction the turtle is facing
    const tip = {
        x: position.x + direction.dx * size,
        y: position.y + direction.dy * size,
    };

    // The base corners are behind the tip, perpendicular to the direction
    const baseCorner1 = {
        x:
            position.x -
            direction.dx * (size / 2) +
            perpendicular.dx * (size / 2),
        y:
            position.y -
            direction.dy * (size / 2) +
            perpendicular.dy * (size / 2),
    };

    const baseCorner2 = {
        x:
            position.x -
            direction.dx * (size / 2) -
            perpendicular.dx * (size / 2),
        y:
            position.y -
            direction.dy * (size / 2) -
            perpendicular.dy * (size / 2),
    };

    // Save the current context state
    ctx.save();

    // Set the style for the turtle cursor
    ctx.fillStyle = "rgba(255, 255, 0, 0.7)"; // Semi-transparent yellow
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    // Draw the triangle
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(baseCorner1.x, baseCorner1.y);
    ctx.lineTo(baseCorner2.x, baseCorner2.y);
    ctx.closePath();

    // Fill and stroke the triangle
    ctx.fill();
    ctx.stroke();

    // Restore the context state
    ctx.restore();
};
