import { MoveConfig } from 'lib/types'
import React, { ForwardedRef, useEffect, useState } from 'react'

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

  const textWidth = `${steps}`.length * 10

  return (
    <g ref={ref} {...props}>
      <path
        className="move-block-path"
        fillOpacity="1"
        d={`m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${
          textWidth + 140
        } a 4,4 0 0,1 4,4 v 40 a 4,4 0 0,1 -4,4 H 48 c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z`}
      />
      <text className="block-text" x="8" y="30">
        move
      </text>
      <ParamInput
        onApplyChange={() => setConfig({ steps })}
        onChange={setSteps}
        value={steps}
      />
      <text className="block-text" x={`${textWidth + 90}`} y="30">
        steps
      </text>
    </g>
  )
}

export const Move = React.forwardRef<SVGGElement, VariantProps>(MoveC)
