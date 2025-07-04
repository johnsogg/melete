/**
 * 3D Vector operations for turtle graphics
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  static unitX(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  static unitY(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  static unitZ(): Vector3 {
    return new Vector3(0, 0, 1);
  }

  static from(vec: Vec3): Vector3 {
    return new Vector3(vec.x, vec.y, vec.z);
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  add(other: Vector3): Vector3 {
    return new Vector3(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z
    );
  }

  subtract(other: Vector3): Vector3 {
    return new Vector3(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z
    );
  }

  multiply(scalar: number): Vector3 {
    return new Vector3(
      this.x * scalar,
      this.y * scalar,
      this.z * scalar
    );
  }

  dot(other: Vector3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other: Vector3): Vector3 {
    return new Vector3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  normalize(): Vector3 {
    const len = this.length();
    if (len === 0) {
      return Vector3.zero();
    }
    return new Vector3(this.x / len, this.y / len, this.z / len);
  }

  equals(other: Vector3, epsilon: number = 1e-10): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon
    );
  }

  toString(): string {
    return `Vector3(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)})`;
  }

  toVec3(): Vec3 {
    return { x: this.x, y: this.y, z: this.z };
  }
}