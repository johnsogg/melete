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

const handleMoveOperation = (
    turtleXfm: Matrix,
    distance: number,
    ctx: RenderContext,
    penDown: boolean
): Matrix => {
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
            turtleXfm = handleMoveOperation(
                turtleXfm,
                turtleOp.move,
                ctx,
                penDown
            );
        } else if (turtleOp.op === "turn") {
            turtleXfm = handleTurnOperation(turtleXfm, turtleOp.turn);
        } else if (turtleOp.op === "penState") {
            penDown = handlePenStateOperation(turtleOp.penState);
        }
    });
};
