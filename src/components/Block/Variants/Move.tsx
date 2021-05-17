import { MoveConfig } from 'lib/types'
import React, { ForwardedRef, useEffect, useRef } from 'react'

import { BLOCK_PATH_TRANSFORM } from '../const'
import { VariantProps } from './const'

interface Props extends VariantProps {
  config: MoveConfig
}

function MoveC({ config, ...props }: Props, ref: ForwardedRef<SVGPathElement>) {
  const textWidth = `${config.steps}`.length * 5
  const width = 150 + textWidth

  const textBoxRef = useRef<SVGGElement | null>(null)

  useEffect(() => {
    if (textBoxRef.current) {
      textBoxRef.current.addEventListener('touchstart', console.log)
    }
  }, [textBoxRef])

  return (
    <g ref={ref} transform={BLOCK_PATH_TRANSFORM} {...props}>
      <path
        className="move-block-path"
        fillOpacity="1"
        d={`m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${width} a 4,4 0 0,1 4,4 v 40 a 4,4 0 0,1 -4,4 H 48 c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z`}
      />
      <text className="block-text" x="8" y="30">
        move
      </text>
      <g ref={textBoxRef} transform="translate(60, 10)">
        <path
          stroke="#3373CC"
          fill="#FFFFFF"
          fillOpacity="1"
          d={`m 0,0 m 16,0 H ${
            textWidth + 24
          } a 16 16 0 0 1 0 32 H 16 a 16 16 0 0 1 0 -32 z`}
        />
        <text x="12" y="21">
          {config.steps}
        </text>
      </g>
      <text className="block-text" x={`${textWidth + 107}`} y="30">
        steps
      </text>
    </g>
  )
}

export const Move = React.forwardRef<SVGPathElement, VariantProps>(MoveC)
