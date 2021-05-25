import { BlockVariant } from 'lib/types'
import React, { SVGProps } from 'react'

import { blockDefaultWidth } from './const'

interface Props extends SVGProps<SVGPathElement> {
  text: string
  blockVariant: BlockVariant
  additionalWidth?: number
}

export function BasicBlockBackground({
  text,
  blockVariant,
  additionalWidth = 0,
  ...props
}: Props) {
  const textWidth = text.length * 9
  const baseWidth = blockDefaultWidth[blockVariant]

  return (
    <path
      {...props}
      d={`m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${
        textWidth + baseWidth + additionalWidth
      } a 4,4 0 0,1 4,4 v 40 a 4,4 0 0,1 -4,4 H 48 c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z`}
    />
  )
}
