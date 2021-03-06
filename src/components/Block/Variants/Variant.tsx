import { BlockVariant, VariantConfig } from 'lib/types'
import { cloneDeep, set } from 'lodash'
import React, { SVGProps, useCallback } from 'react'
import { Block, BlockPath } from 'state/scriptEditor'

import { BLOCK_SCALE } from '../const'
import { GoToRandom } from './GoToRandom'
import { Move } from './Move'
import { PlaySound } from './PlaySound'
import { TurnLeft } from './TurnLeft'
import { TurnRight } from './TurnRight'

const variantToComponent = {
  [BlockVariant.Move]: Move,
  [BlockVariant.TurnRight]: TurnRight,
  [BlockVariant.TurnLeft]: TurnLeft,
  [BlockVariant.GoToRandom]: GoToRandom,
  [BlockVariant.PlaySound]: PlaySound,
}

interface Props extends SVGProps<SVGGElement> {
  block: Block
  path: BlockPath
  setBlocksState: (newState: any) => void
}

function VariantC(
  { block, path, setBlocksState, transform, ...props }: Props,
  ref: any
) {
  const Comp = variantToComponent[block.variant]

  const setConfig = useCallback(
    (config: VariantConfig) => {
      setBlocksState((origState: any) => {
        const state = cloneDeep(origState)
        set(state, `${path}.config`, config)
        return state
      })
    },
    [setBlocksState, path]
  )

  return (
    <Comp
      setConfig={setConfig}
      config={block.config as any}
      ref={ref}
      transform={`${transform ? transform : ''} scale(${BLOCK_SCALE})`}
      {...props}
    />
  )
}

export const Variant = React.forwardRef<SVGGElement, Props>(VariantC)
