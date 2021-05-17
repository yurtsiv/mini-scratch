import { VariantConfig } from 'lib/types'
import { SVGProps } from 'react'

export interface VariantProps extends SVGProps<SVGGElement> {
  config: VariantConfig
  setConfig: (c: VariantConfig) => void
}
