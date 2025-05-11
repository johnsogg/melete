export type Melete<T> = {
  // ------------------------------- time stuff
  tick: number;
  lastRenderTick: number;

  // ------------------------------- interaction stuff
  mouse: MouseData;
  mouseEvents: Array<MouseEvent>;
  keyboard: KeyboardData;
  keyboardEvents: Array<KeyboardEvent>;

  // ------------------------------- canvas geometry
  canvasSize: Size;

  // ------------------------------- user defined model data
  model: T;

  // ------------------------------- drawing layers (buffers)
  layers: Array<Layer>;
};

export type Pt = {
  x: number;
  y: number;
};

export type Vec = {
  dx: number;
  dy: number;
};

export type Size = {
  width: number;
  height: number;
};

export type KeyboardModifiers = {
  shift: boolean;
  control: boolean;
  // TODO: need more keyboard mods
};

export type MouseData = {
  position: Pt;
  modifiers: KeyboardModifiers;
  leftState: "down" | "up";
  rightState: "down" | "up";
};

export type KeyEngaged = {
  value: string;
  time: number;
  tick: number;
};

export type KeyboardData = {
  keysEngaged: Array<KeyEngaged>;
};

export type Color = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
  // should expand this to be RGBColor | HSLColor | StringColor
};

export type Layer = {
  ops: Array<PenOp | CameraOp | DrawOp>;
};

export type PenOp = {
  thickness?: number;
  paint?: Color;
};

export type CameraOp = {
  scale?: number;
  rotate?: number;
  pan?: Vec;
};

export type DrawOp = {
  forward?: number;
  turn?: number;
  down?: boolean;
  facePoint?: Pt;
  faceDir?: Vec;
};
