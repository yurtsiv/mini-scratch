import { BlockVariant, PlaySoundConfig } from 'lib/types'
import React, { ForwardedRef } from 'react'

import { BasicBlockBackground } from './BasicBlockBackground'
import { VariantProps } from './const'

interface Props extends VariantProps {
  config: PlaySoundConfig
}

function PlaySoundC(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { config, setConfig, ...props }: Props,
  ref: ForwardedRef<SVGGElement>
) {
  return (
    <g ref={ref} {...props}>
      <BasicBlockBackground
        className="sound-block-path"
        text=""
        blockVariant={BlockVariant.GoToRandom}
        additionalWidth={10}
      />
      <text className="block-text initial" x="8" y="30">
        play sound
      </text>
    </g>
  )
}

export const PlaySound = React.forwardRef<SVGGElement, Props>(PlaySoundC)
