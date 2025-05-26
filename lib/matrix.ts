import { Dir, Matrix, Pt, Vec } from "./types";

/**
 * Creates an identity matrix.
 */
export const identityMatrix = (): Matrix => {
    return {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
    };
};

/**
 * Creates a translation matrix based on a vector.
 */
export const translationMatrix = (translation: Vec): Matrix => {
    return {
        a: 1,
        c: 0,
        e: translation.dx,
        b: 0,
        d: 1,
        f: translation.dy,
    };
};

/**
 * Creates a rotation matrix based on an angle in radians.
 */
export const rotationMatrix = (angleRadians: number): Matrix => {
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);
    return {
        a: cos,
        c: -sin,
        e: 0,
        b: sin,
        d: cos,
        f: 0,
    };
};

/**
 * Converts an angle from degrees to radians.
 */
export const degreesToRadians = (degrees: number): number => {
    return (degrees * Math.PI) / 180;
};

/**
 * Creates a rotation matrix based on an angle in degrees. This just converts
 * the argument to radians and uses `rotationMatrix`.
 */
export const rotationMatrixDegrees = (angleDegrees: number): Matrix => {
    const radians = degreesToRadians(angleDegrees);
    return rotationMatrix(radians);
};

/**
 * Creates a scaling matrix that scales in X dimension.
 */
export const scaleXMatrix = (factor: number): Matrix => {
    return {
        a: factor,
        c: 0,
        e: 0,
        b: 0,
        d: 1,
        f: 0,
    };
};

/**
 * Creates a scaling matrix that scales in Y dimension.
 */
export const scaleYMatrix = (factor: number): Matrix => {
    return {
        a: 1,
        c: 0,
        e: 0,
        b: 0,
        d: factor,
        f: 0,
    };
};

/**
 * Creates a scaling matrix that scales uniformly in both dimensions.
 */
export const scaleMatrix = (factor: number): Matrix => {
    return {
        a: factor,
        c: 0,
        e: 0,
        b: 0,
        d: factor,
        f: 0,
    };
};

/**
 * Multiplies two matrices and returns the result.
 */
export const multiplyMatrices = (m1: Matrix, m2: Matrix): Matrix => {
    return {
        a: m1.a * m2.a + m1.c * m2.b,
        b: m1.b * m2.a + m1.d * m2.b,
        c: m1.a * m2.c + m1.c * m2.d,
        d: m1.b * m2.c + m1.d * m2.d,
        e: m1.a * m2.e + m1.c * m2.f + m1.e,
        f: m1.b * m2.e + m1.d * m2.f + m1.f,
    };
};

/**
 * Calculates the determinant of a matrix.
 */
export const determinant = (m: Matrix): number => {
    return m.a * m.d - m.b * m.c;
};

/**
 * Checks if a matrix is singular (cannot be inverted).
 */
export const isSingular = (m: Matrix): boolean => {
    return Math.abs(determinant(m)) < 1e-10; // Using a small epsilon for floating point comparison.
};

/**
 * Calculates the inverse of a matrix.
 * Throws an error if the matrix is singular.
 */
export const inverseMatrix = (m: Matrix): Matrix => {
    const det = determinant(m);

    if (isSingular(m)) {
        throw new Error("Cannot invert a singular matrix");
    }

    const invDet = 1 / det;

    return {
        a: m.d * invDet,
        b: -m.b * invDet,
        c: -m.c * invDet,
        d: m.a * invDet,
        e: (m.c * m.f - m.d * m.e) * invDet,
        f: (m.b * m.e - m.a * m.f) * invDet,
    };
};

/**
 * Returns the current position represented by a transformation matrix.
 */
export const currentPosition = (m: Matrix): Pt => {
    // The current position is given by the translation components of the matrix.
    return {
        x: m.e,
        y: m.f,
    };
};

/**
 * Transforms a point from model space to screen space using the transformation
 * matrix.
 */
export const transformPoint = (m: Matrix, p: Pt): Pt => {
    return {
        x: m.a * p.x + m.c * p.y + m.e,
        y: m.b * p.x + m.d * p.y + m.f,
    };
};

/**
 * Transforms a vector using the transformation matrix (ignoring translation).
 */
export const transformVector = (m: Matrix, v: Vec): Vec => {
    return {
        dx: m.a * v.dx + m.c * v.dy,
        dy: m.b * v.dx + m.d * v.dy,
    };
};

/**
 * Transforms a direction vector and ensures it maintains unit length.
 */
export const transformDirection = (m: Matrix, dir: Dir): Dir => {
    const transformed = transformVector(m, dir);
    const length = Math.sqrt(
        transformed.dx * transformed.dx + transformed.dy * transformed.dy
    );

    if (length < 1e-10) {
        return { dx: 0, dy: 0 }; // Prevent division by zero.
    }

    return {
        dx: transformed.dx / length,
        dy: transformed.dy / length,
    };
};

/**
 * Transforms a point from screen space back to model space using the inverse of
 * the transformation matrix.
 */
export const inverseTransformPoint = (m: Matrix, p: Pt): Pt => {
    try {
        const inv = inverseMatrix(m);
        return transformPoint(inv, p);
    } catch (_e) {
        throw new Error("Cannot transform point with singular matrix");
    }
};

/**
 * Creates a combined transformation matrix from multiple operations.
 */
export const createTransformMatrix = (
    translation?: Vec,
    rotation?: number,
    scale?: number | { x: number; y: number }
): Matrix => {
    let matrix = identityMatrix();

    // Apply operations in order: scale, rotate, translate.
    if (scale !== undefined) {
        if (typeof scale === "number") {
            matrix = multiplyMatrices(matrix, scaleMatrix(scale));
        } else {
            matrix = multiplyMatrices(matrix, scaleXMatrix(scale.x));
            matrix = multiplyMatrices(matrix, scaleYMatrix(scale.y));
        }
    }

    if (rotation !== undefined) {
        matrix = multiplyMatrices(matrix, rotationMatrix(rotation));
    }

    if (translation !== undefined) {
        matrix = multiplyMatrices(matrix, translationMatrix(translation));
    }

    return matrix;
};

/**
 * A debugging function to print out a matrix with properly aligned decimal points.
 */
export const printMatrix = (m: Matrix): string => {
    // Find the maximum number of digits needed for proper alignment
    const values = [m.a, m.b, m.c, m.d, m.e, m.f, 0]; // Include 0 for the last row

    // Get the maximum number of digits before the decimal point
    const maxBeforeDecimal = values.reduce((max, val) => {
        const digits =
            Math.abs(val) < 1 ? 1 : Math.floor(Math.log10(Math.abs(val))) + 1;
        return Math.max(max, digits);
    }, 0);

    // Format a number with proper padding to align decimal points
    const format = (n: number) => {
        const isNegative = n < 0;
        const absValue = Math.abs(n);

        // Get integer and decimal parts
        const integerPart = Math.floor(absValue).toString();
        const decimalPart = absValue.toFixed(2).split(".")[1];

        // Calculate padding for proper alignment
        const padding = " ".repeat(maxBeforeDecimal - integerPart.length);

        // Combine with sign, padding, and proper spacing
        return `${isNegative ? "-" : " "}${padding}${integerPart}.${decimalPart}`;
    };

    return `[
    ${format(m.a)} ${format(m.c)} ${format(m.e)}
    ${format(m.b)} ${format(m.d)} ${format(m.f)}
    ${format(0)} ${format(0)} ${format(1)}
  ]`;
};
