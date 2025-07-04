/**
 * Matrix stack for hierarchical turtle operations
 */

import { TurtleState } from './state';

export class TurtleStack {
  private stack: TurtleState[] = [];

  push(state: TurtleState): void {
    this.stack.push(state.clone());
  }

  pop(): TurtleState | undefined {
    return this.stack.pop();
  }

  peek(): TurtleState | undefined {
    if (this.stack.length === 0) return undefined;
    return this.stack[this.stack.length - 1].clone();
  }

  size(): number {
    return this.stack.length;
  }

  clear(): void {
    this.stack = [];
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }
}
