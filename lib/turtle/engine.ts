/**
 * Turtle command execution engine
 */

import { TurtleState } from './state';
import {
  TurtleCommand,
  TurtleAngleUnitsCommand,
  TurtlePushCommand,
  TurtlePopCommand,
  AngleUnitAware,
  AngleUnit,
} from './commands';
import { TurtleStack } from './stack';

export interface TurtleExecutionContext {
  state: TurtleState;
  defaultAngleUnits: AngleUnit;
  stack: TurtleStack;
}

export class TurtleEngine {
  private context: TurtleExecutionContext;

  constructor(initialState?: TurtleState) {
    this.context = {
      state: initialState ? initialState.clone() : new TurtleState(),
      defaultAngleUnits: 'radians',
      stack: new TurtleStack(),
    };
  }

  execute(commands: TurtleCommand[]): TurtleState {
    for (const command of commands) {
      this.executeCommand(command);
    }
    return this.context.state.clone();
  }

  private executeCommand(command: TurtleCommand): void {
    if (command instanceof TurtleAngleUnitsCommand) {
      this.context.defaultAngleUnits = command.getUnits();
    } else if (command instanceof TurtlePushCommand) {
      this.context.stack.push(this.context.state);
    } else if (command instanceof TurtlePopCommand) {
      const previousState = this.context.stack.pop();
      if (previousState) {
        this.context.state = previousState;
      } else {
        console.warn('TurtleEngine: Attempted to pop from empty stack');
      }
    } else {
      // For commands that support default angle units, update them
      if ('setDefaultUnits' in command) {
        (command as AngleUnitAware).setDefaultUnits(
          this.context.defaultAngleUnits
        );
      }
      command.execute(this.context.state);
    }
  }

  getState(): TurtleState {
    return this.context.state.clone();
  }

  getContext(): TurtleExecutionContext {
    return {
      state: this.context.state.clone(),
      defaultAngleUnits: this.context.defaultAngleUnits,
      stack: this.context.stack, // Stack is shared for debugging purposes
    };
  }

  reset(initialState?: TurtleState): void {
    this.context = {
      state: initialState ? initialState.clone() : new TurtleState(),
      defaultAngleUnits: 'radians',
      stack: new TurtleStack(),
    };
  }
}

// Convenience function for executing a sequence of commands
export function executeTurtleSequence(
  commands: TurtleCommand[],
  initialState?: TurtleState
): TurtleState {
  const engine = new TurtleEngine(initialState);
  return engine.execute(commands);
}
