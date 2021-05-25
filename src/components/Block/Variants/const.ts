import { BlockVariant, VariantConfig } from 'lib/types'
import { SVGProps } from 'react'

export interface VariantProps extends SVGProps<SVGGElement> {
  config: VariantConfig
  setConfig: (c: VariantConfig) => void
}

export const blockDefaultWidth = {
  [BlockVariant.Move]: 108,
  [BlockVariant.TurnRight]: 133,
  [BlockVariant.TurnLeft]: 133,
  [BlockVariant.GoToRandom]: 80,
}
