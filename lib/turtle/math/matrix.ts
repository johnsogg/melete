/**
 * 4x4 Matrix operations for turtle graphics transformations
 */

export type Matrix4x4 = [
  number, number, number, number, // row 1
  number, number, number, number, // row 2
  number, number, number, number, // row 3
  number, number, number, number, // row 4
];

export class Matrix4 {
  data: Matrix4x4;

  constructor(data?: Matrix4x4) {
    this.data = data || Matrix4.identity().data;
  }

  static identity(): Matrix4 {
    return new Matrix4([
      1, 0, 0, 0, // row 1
      0, 1, 0, 0, // row 2
      0, 0, 1, 0, // row 3
      0, 0, 0, 1, // row 4
    ]);
  }

  static translation(x: number, y: number, z: number = 0): Matrix4 {
    return new Matrix4([
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1
    ]);
  }

  static rotationX(angleRadians: number): Matrix4 {
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);
    return new Matrix4([
      1, 0,    0,   0,
      0, cos, -sin, 0,
      0, sin,  cos, 0,
      0, 0,    0,   1
    ]);
  }

  static rotationY(angleRadians: number): Matrix4 {
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);
    return new Matrix4([
      cos,  0, sin, 0,
      0,    1, 0,   0,
      -sin, 0, cos, 0,
      0,    0, 0,   1
    ]);
  }

  static rotationZ(angleRadians: number): Matrix4 {
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);
    return new Matrix4([
      cos, -sin, 0, 0,
      sin,  cos, 0, 0,
      0,    0,   1, 0,
      0,    0,   0, 1
    ]);
  }

  multiply(other: Matrix4): Matrix4 {
    const a = this.data;
    const b = other.data;
    const result: Matrix4x4 = [
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0
    ];

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[row * 4 + k] * b[k * 4 + col];
        }
        result[row * 4 + col] = sum;
      }
    }

    return new Matrix4(result);
  }

  clone(): Matrix4 {
    return new Matrix4([...this.data]);
  }

  equals(other: Matrix4, epsilon: number = 1e-10): boolean {
    for (let i = 0; i < 16; i++) {
      if (Math.abs(this.data[i] - other.data[i]) > epsilon) {
        return false;
      }
    }
    return true;
  }

  getTranslation(): { x: number; y: number; z: number } {
    return {
      x: this.data[3],
      y: this.data[7],
      z: this.data[11]
    };
  }

  toString(): string {
    const d = this.data;
    return `Matrix4([
  ${d[0].toFixed(3)}, ${d[1].toFixed(3)}, ${d[2].toFixed(3)}, ${d[3].toFixed(3)},
  ${d[4].toFixed(3)}, ${d[5].toFixed(3)}, ${d[6].toFixed(3)}, ${d[7].toFixed(3)},
  ${d[8].toFixed(3)}, ${d[9].toFixed(3)}, ${d[10].toFixed(3)}, ${d[11].toFixed(3)},
  ${d[12].toFixed(3)}, ${d[13].toFixed(3)}, ${d[14].toFixed(3)}, ${d[15].toFixed(3)}
])`;
  }
}