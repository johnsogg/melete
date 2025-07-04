/**
 * Main turtle graphics interface
 */

export * from './math';
export * from './state';
export * from './commands';
export * from './engine';
export * from './path';
export * from './stack';

import { TurtleCommand } from './commands';
import { executeTurtleSequence } from './engine';
import { TurtleState } from './state';

// Main API function matching TURTLE_PLAN.md specification
export function drawTurtleSequence(
  commands: TurtleCommand[],
  initialState?: TurtleState
): TurtleState {
  return executeTurtleSequence(commands, initialState);
}
