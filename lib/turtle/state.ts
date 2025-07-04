/**
 * TurtleState class manages the turtle's position, orientation, and pen state
 */

import { Vector3 } from './math/vector';
import { Matrix4 } from './math/matrix';
import { TurtleExecutable, TurtlePosition } from './commands';

export type { TurtlePosition };

export class TurtleState implements TurtleExecutable {
  private position: Vector3;
  private forward: Vector3;
  private up: Vector3;
  private right: Vector3;
  private penDown: boolean;

  constructor(
    position: TurtlePosition = { x: 0, y: 0, z: 0 },
    heading: Vector3 = Vector3.unitY()
  ) {
    this.position = Vector3.from(position);
    this.forward = heading.normalize();
    this.up = Vector3.unitZ();
    this.right = this.forward.cross(this.up).normalize();
    this.penDown = true;
  }

  clone(): this {
    const cloned = new TurtleState();
    cloned.position = this.position.clone();
    cloned.forward = this.forward.clone();
    cloned.up = this.up.clone();
    cloned.right = this.right.clone();
    cloned.penDown = this.penDown;
    return cloned as this;
  }

  getPosition(): TurtlePosition {
    return this.position.toVec3();
  }

  getForward(): Vector3 {
    return this.forward.clone();
  }

  getUp(): Vector3 {
    return this.up.clone();
  }

  getRight(): Vector3 {
    return this.right.clone();
  }

  isPenDown(): boolean {
    return this.penDown;
  }

  setPenDown(down: boolean): void {
    this.penDown = down;
  }

  moveForward(distance: number): void {
    const movement = this.forward.multiply(distance);
    this.position = this.position.add(movement);
  }

  moveBackward(distance: number): void {
    this.moveForward(-distance);
  }

  moveLeft(distance: number): void {
    const movement = this.right.multiply(-distance);
    this.position = this.position.add(movement);
  }

  moveRight(distance: number): void {
    const movement = this.right.multiply(distance);
    this.position = this.position.add(movement);
  }

  moveUp(distance: number): void {
    const movement = this.up.multiply(distance);
    this.position = this.position.add(movement);
  }

  moveDown(distance: number): void {
    this.moveUp(-distance);
  }

  turnLeft(angleRadians: number): void {
    this.rotateAroundAxis(this.up, angleRadians);
  }

  turnRight(angleRadians: number): void {
    this.turnLeft(-angleRadians);
  }

  pitch(angleRadians: number): void {
    this.rotateAroundAxis(this.right, angleRadians);
  }

  roll(angleRadians: number): void {
    this.rotateAroundAxis(this.forward, angleRadians);
  }

  private rotateAroundAxis(axis: Vector3, angleRadians: number): void {
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);
    const oneMinusCos = 1 - cos;

    const u = axis.normalize();
    const ux = u.x;
    const uy = u.y;
    const uz = u.z;

    const rotationMatrix = new Matrix4([
      cos + ux * ux * oneMinusCos,
      ux * uy * oneMinusCos - uz * sin,
      ux * uz * oneMinusCos + uy * sin,
      0,

      uy * ux * oneMinusCos + uz * sin,
      cos + uy * uy * oneMinusCos,
      uy * uz * oneMinusCos - ux * sin,
      0,

      uz * ux * oneMinusCos - uy * sin,
      uz * uy * oneMinusCos + ux * sin,
      cos + uz * uz * oneMinusCos,
      0,

      0,
      0,
      0,
      1,
    ]);

    this.forward = this.applyRotationToVector(rotationMatrix, this.forward);
    this.up = this.applyRotationToVector(rotationMatrix, this.up);
    this.right = this.applyRotationToVector(rotationMatrix, this.right);

    this.forward = this.forward.normalize();
    this.up = this.up.normalize();
    this.right = this.right.normalize();
  }

  private applyRotationToVector(
    rotationMatrix: Matrix4,
    vector: Vector3
  ): Vector3 {
    const m = rotationMatrix.data;
    return new Vector3(
      m[0] * vector.x + m[1] * vector.y + m[2] * vector.z,
      m[4] * vector.x + m[5] * vector.y + m[6] * vector.z,
      m[8] * vector.x + m[9] * vector.y + m[10] * vector.z
    );
  }

  getTransformationMatrix(): Matrix4 {
    const pos = this.position;

    return new Matrix4([
      this.right.x,
      this.up.x,
      this.forward.x,
      pos.x,
      this.right.y,
      this.up.y,
      this.forward.y,
      pos.y,
      this.right.z,
      this.up.z,
      this.forward.z,
      pos.z,
      0,
      0,
      0,
      1,
    ]);
  }

  toString(): string {
    return `TurtleState {
  position: ${this.position.toString()},
  forward: ${this.forward.toString()},
  up: ${this.up.toString()},
  right: ${this.right.toString()},
  penDown: ${this.penDown}
}`;
  }
}
