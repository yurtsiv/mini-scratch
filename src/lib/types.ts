export type Coords = {
  x: number
  y: number
}

export enum BlockVariant {
  Move,
  TurnRight,
  TurnLeft,
  GoToRandom,
}

export type MoveConfig = {
  steps: number
}

export type RotateConfig = {
  degrees: number
}

export type GoToRandomConfig = {}

export type VariantConfig = MoveConfig | RotateConfig | GoToRandomConfig
