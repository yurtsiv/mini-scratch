import { BlockVariant, GoToRandomConfig } from 'lib/types'
import React, { ForwardedRef } from 'react'

import { BasicBlockBackground } from './BasicBlockBackground'
import { VariantProps } from './const'

interface Props extends VariantProps {
  config: GoToRandomConfig
}

function GoToRandomC(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { config, setConfig, ...props }: Props,
  ref: ForwardedRef<SVGGElement>
) {
  return (
    <g ref={ref} {...props}>
      <BasicBlockBackground
        className="motion-block-path"
        text=""
        blockVariant={BlockVariant.GoToRandom}
        additionalWidth={30}
      />
      <text className="block-text initial" x="8" y="30">
        go to random
      </text>
    </g>
  )
}

export const GoToRandom = React.forwardRef<SVGGElement, Props>(GoToRandomC)
