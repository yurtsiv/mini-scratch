export type Coords = {
  x: number
  y: number
}

export enum BlockVariant {
  Move,
}

export type MoveConfig = {
  steps: number
}

export type VariantConfig = MoveConfig
