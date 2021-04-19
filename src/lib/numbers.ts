export const clamp = (min: number, max: number, x: number): number =>
  x > max ? max : x < min ? min : x
