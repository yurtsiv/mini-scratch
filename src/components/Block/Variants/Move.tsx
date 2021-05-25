import { BlockVariant, MoveConfig } from 'lib/types'
import React, { ForwardedRef, useEffect, useState } from 'react'

import { BasicBlockBackground } from './BasicBlockBackground'
import { ParamInput } from './ParamInput'
import { VariantProps } from './const'

interface Props extends VariantProps {
  config: MoveConfig
}

function MoveC(
  { setConfig, config, ...props }: Props,
  ref: ForwardedRef<SVGGElement>
) {
  const [steps, setSteps] = useState(config.steps)
  useEffect(() => {
    setSteps(config.steps)
  }, [config.steps])

  const textWidth = `${steps}`.length * 9

  return (
    <g ref={ref} {...props}>
      <BasicBlockBackground
        className="motion-block-path"
        text={`${steps}`}
        blockVariant={BlockVariant.Move}
        additionalWidth={33}
      />
      <text className="block-text initial" x="8" y="30">
        move
      </text>
      <ParamInput
        onApplyChange={() => setConfig({ steps })}
        onChange={setSteps}
        value={steps}
        offsetX={60}
      />
      <text className="block-text" x={`${textWidth + 90}`} y="30">
        steps
      </text>
    </g>
  )
}

export const Move = React.forwardRef<SVGGElement, Props>(MoveC)
