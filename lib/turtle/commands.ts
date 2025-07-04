/**
 * Turtle command system - implements the API from TURTLE_PLAN.md
 */

import { degreesToRadians } from './math/index';
import { Vector3 } from './math/vector';

export type AngleUnit = 'radians' | 'degrees';

export interface AngleUnitAware {
  setDefaultUnits(units: AngleUnit): void;
}

export interface TurtlePosition {
  x: number;
  y: number;
  z: number;
}

/**
 * Interface defining all operations that turtle commands can perform on turtle state
 */
export interface TurtleExecutable {
  // Pen operations
  setPenDown(down: boolean): void;
  isPenDown(): boolean;

  // Movement operations
  moveForward(distance: number): void;
  moveBackward(distance: number): void;
  moveLeft(distance: number): void;
  moveRight(distance: number): void;
  moveUp(distance: number): void;
  moveDown(distance: number): void;

  // Rotation operations
  turnLeft(angleRadians: number): void;
  turnRight(angleRadians: number): void;
  pitch(angleRadians: number): void;
  roll(angleRadians: number): void;

  // State access (for advanced commands)
  getPosition(): TurtlePosition;
  getForward(): Vector3;
  getUp(): Vector3;
  getRight(): Vector3;
  clone(): this;
}

export interface AngleOptions {
  units?: AngleUnit;
}

export interface TurtleMoveOptions {
  forward?: number;
  backward?: number;
  left?: number;
  right?: number;
  up?: number;
  down?: number;
}

export interface TurtleTurnOptions {
  left?: number;
  right?: number;
  pitch?: number;
  yaw?: number;
  roll?: number;
  units?: AngleUnit;
}

export abstract class TurtleCommand {
  abstract execute(state: TurtleExecutable): void;
  abstract clone(): TurtleCommand;
}

export class TurtleAngleUnitsCommand extends TurtleCommand {
  constructor(private units: AngleUnit) {
    super();
  }

  execute(): void {
    // This command sets the default angle unit context
    // Implementation will be handled by the execution engine
  }

  clone(): TurtleAngleUnitsCommand {
    return new TurtleAngleUnitsCommand(this.units);
  }

  getUnits(): AngleUnit {
    return this.units;
  }
}

export class TurtlePenUpCommand extends TurtleCommand {
  execute(state: TurtleExecutable): void {
    state.setPenDown(false);
  }

  clone(): TurtlePenUpCommand {
    return new TurtlePenUpCommand();
  }
}

export class TurtlePenDownCommand extends TurtleCommand {
  execute(state: TurtleExecutable): void {
    state.setPenDown(true);
  }

  clone(): TurtlePenDownCommand {
    return new TurtlePenDownCommand();
  }
}

export class TurtleMoveCommand extends TurtleCommand {
  constructor(private options: TurtleMoveOptions) {
    super();
    this.validateOptions();
  }

  private validateOptions(): void {
    const keys = Object.keys(this.options);
    const definedKeys = keys.filter(
      key => this.options[key as keyof TurtleMoveOptions] !== undefined
    );

    if (definedKeys.length === 0) {
      console.warn('TurtleMoveCommand: No movement direction specified');
    } else if (definedKeys.length > 1) {
      console.warn(
        `TurtleMoveCommand: Multiple movement directions specified (${definedKeys.join(', ')}), only first will be used`
      );
    }
  }

  execute(state: TurtleExecutable): void {
    this.options.forward && state.moveForward(this.options.forward);
    this.options.backward && state.moveBackward(this.options.backward);
    this.options.left && state.moveLeft(this.options.left);
    this.options.right && state.moveRight(this.options.right);
    this.options.up && state.moveUp(this.options.up);
    this.options.down && state.moveDown(this.options.down);
  }

  clone(): TurtleMoveCommand {
    return new TurtleMoveCommand({ ...this.options });
  }

  getOptions(): TurtleMoveOptions {
    return { ...this.options };
  }
}

export class TurtleTurnCommand extends TurtleCommand implements AngleUnitAware {
  private defaultUnits: AngleUnit = 'radians';

  constructor(
    private options: TurtleTurnOptions,
    defaultUnits: AngleUnit = 'radians'
  ) {
    super();
    this.defaultUnits = defaultUnits;
    this.validateOptions();
  }

  private validateOptions(): void {
    const keys = Object.keys(this.options).filter(key => key !== 'units');
    const definedKeys = keys.filter(
      key => this.options[key as keyof TurtleTurnOptions] !== undefined
    );

    if (definedKeys.length === 0) {
      console.warn('TurtleTurnCommand: No turn direction specified');
    } else if (definedKeys.length > 1) {
      console.warn(
        `TurtleTurnCommand: Multiple turn directions specified (${definedKeys.join(', ')}), only first will be used`
      );
    }
  }

  execute(state: TurtleExecutable): void {
    const units = this.options.units || this.defaultUnits;
    const convertAngle = (angle: number) =>
      units === 'degrees' ? degreesToRadians(angle) : angle;

    this.options.left && state.turnLeft(convertAngle(this.options.left));
    this.options.right && state.turnRight(convertAngle(this.options.right));
    this.options.pitch && state.pitch(convertAngle(this.options.pitch));
    this.options.yaw && state.turnLeft(convertAngle(this.options.yaw)); // Yaw is equivalent to turning left/right
    this.options.roll && state.roll(convertAngle(this.options.roll));
  }

  clone(): TurtleTurnCommand {
    return new TurtleTurnCommand({ ...this.options }, this.defaultUnits);
  }

  setDefaultUnits(units: AngleUnit): void {
    this.defaultUnits = units;
  }

  getOptions(): TurtleTurnOptions {
    return { ...this.options };
  }
}

export class TurtleLeftCommand extends TurtleCommand implements AngleUnitAware {
  private defaultUnits: AngleUnit = 'radians';

  constructor(
    private angle: number,
    private options: AngleOptions = {},
    defaultUnits: AngleUnit = 'radians'
  ) {
    super();
    this.defaultUnits = defaultUnits;
  }

  execute(state: TurtleExecutable): void {
    const units = this.options.units || this.defaultUnits;
    const angle =
      units === 'degrees' ? degreesToRadians(this.angle) : this.angle;
    state.turnLeft(angle);
  }

  clone(): TurtleLeftCommand {
    return new TurtleLeftCommand(
      this.angle,
      { ...this.options },
      this.defaultUnits
    );
  }

  setDefaultUnits(units: AngleUnit): void {
    this.defaultUnits = units;
  }

  getAngle(): number {
    return this.angle;
  }

  getOptions(): AngleOptions {
    return { ...this.options };
  }
}

export class TurtleRightCommand
  extends TurtleCommand
  implements AngleUnitAware
{
  private defaultUnits: AngleUnit = 'radians';

  constructor(
    private angle: number,
    private options: AngleOptions = {},
    defaultUnits: AngleUnit = 'radians'
  ) {
    super();
    this.defaultUnits = defaultUnits;
  }

  execute(state: TurtleExecutable): void {
    const units = this.options.units || this.defaultUnits;
    const angle =
      units === 'degrees' ? degreesToRadians(this.angle) : this.angle;
    state.turnRight(angle);
  }

  clone(): TurtleRightCommand {
    return new TurtleRightCommand(
      this.angle,
      { ...this.options },
      this.defaultUnits
    );
  }

  setDefaultUnits(units: AngleUnit): void {
    this.defaultUnits = units;
  }

  getAngle(): number {
    return this.angle;
  }

  getOptions(): AngleOptions {
    return { ...this.options };
  }
}

// Factory functions matching the API from TURTLE_PLAN.md

export function turtleAngleUnits(units: AngleUnit): TurtleAngleUnitsCommand {
  return new TurtleAngleUnitsCommand(units);
}

export function turtlePenUp(): TurtlePenUpCommand {
  return new TurtlePenUpCommand();
}

export function turtlePenDown(): TurtlePenDownCommand {
  return new TurtlePenDownCommand();
}

export function turtleMove(options: TurtleMoveOptions): TurtleMoveCommand {
  return new TurtleMoveCommand(options);
}

export function turtleTurn(options: TurtleTurnOptions): TurtleTurnCommand {
  return new TurtleTurnCommand(options);
}

export function turtleLeft(
  angle: number,
  options: AngleOptions = {}
): TurtleLeftCommand {
  return new TurtleLeftCommand(angle, options);
}

export function turtleRight(
  angle: number,
  options: AngleOptions = {}
): TurtleRightCommand {
  return new TurtleRightCommand(angle, options);
}

export class TurtlePushCommand extends TurtleCommand {
  execute(): void {
    // Push operation is handled by the engine
  }

  clone(): TurtlePushCommand {
    return new TurtlePushCommand();
  }
}

export class TurtlePopCommand extends TurtleCommand {
  execute(): void {
    // Pop operation is handled by the engine
  }

  clone(): TurtlePopCommand {
    return new TurtlePopCommand();
  }
}

export function turtlePush(): TurtlePushCommand {
  return new TurtlePushCommand();
}

export function turtlePop(): TurtlePopCommand {
  return new TurtlePopCommand();
}
