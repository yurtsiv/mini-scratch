import { TurnRightIcon } from 'components/Icons/TurnRightIcon'
import { RotateConfig } from 'lib/types'
import React, { ForwardedRef } from 'react'

import { Turn } from './Turn'
import { VariantProps } from './const'

interface Props extends VariantProps {
  config: RotateConfig
}

export function TurnRightC(props: Props, ref: ForwardedRef<SVGGElement>) {
  return <Turn IconComp={TurnRightIcon} {...props} ref={ref} />
}

export const TurnRight = React.forwardRef<SVGGElement, Props>(TurnRightC)
