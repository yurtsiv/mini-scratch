import { TurnLeftIcon } from 'components/Icons/TurnLeftIcon'
import { RotateConfig } from 'lib/types'
import React, { ForwardedRef } from 'react'

import { Turn } from './Turn'
import { VariantProps } from './const'

interface Props extends VariantProps {
  config: RotateConfig
}

export function TurnLeftC(props: Props, ref: ForwardedRef<SVGGElement>) {
  return <Turn IconComp={TurnLeftIcon} {...props} ref={ref} />
}

export const TurnLeft = React.forwardRef<SVGGElement, Props>(TurnLeftC)
