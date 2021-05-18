import { BlockVariant, VariantConfig } from 'lib/types'
import { cloneDeep, set } from 'lodash'
import React, { SVGProps, useCallback } from 'react'
import { SetterOrUpdater } from 'recoil'
import { Block, BlockPath, BlocksState } from 'state/scriptEditor'

import { Move } from './Move'

const variantToComponent = {
  [BlockVariant.Move]: Move,
}

interface Props extends SVGProps<SVGGElement> {
  block: Block
  path: BlockPath
  setBlocksState: SetterOrUpdater<BlocksState>
}

function VariantC({ block, path, setBlocksState, ...props }: Props, ref: any) {
  const Comp = variantToComponent[block.variant]

  const setConfig = useCallback(
    (config: VariantConfig) => {
      setBlocksState((origState) => {
        const state = cloneDeep(origState)
        set(state, `${path}.config`, config)
        return state
      })
    },
    [setBlocksState, path]
  )

  return (
    <Comp setConfig={setConfig} config={block.config} ref={ref} {...props} />
  )
}

export const Variant = React.forwardRef<SVGGElement, Props>(VariantC)
