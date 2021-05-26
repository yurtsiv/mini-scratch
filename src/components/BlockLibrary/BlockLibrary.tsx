import { Block } from 'components/Block/Block'
import { useVM } from 'lib/vm'
import { cloneDeep } from 'lodash'
import React, { RefObject, useCallback } from 'react'

import './style.css'
import { useBlockLibrary } from './useBlockLibrary'

type Props = {
  editorRef: RefObject<SVGElement>
}

export function BlockLibrary({ editorRef }: Props) {
  const vm = useVM()
  const {
    blockLibRef,
    editingTargetBlocks,
    setBlocksState,
    libraryBlocks,
    highlighted,
    scrollX,
  } = useBlockLibrary()

  const changeBlocksState = useCallback(
    (newStateGetter: any) => {
      setBlocksState((origState) => {
        const state = cloneDeep(origState)
        const targetId = vm.editingTarget.id
        state[targetId] = newStateGetter(origState[targetId])
        return state
      })
    },
    [setBlocksState, vm]
  )

  if (!editingTargetBlocks) {
    return null
  }

  return (
    <g className="block-lib-container" ref={blockLibRef}>
      <rect width="100%" height="80" fill={highlighted ? '#ddd' : '#eee'} />
      <g transform={`translate(${scrollX}, 0)`}>
        {libraryBlocks.map(([block, offsetX]: any) => (
          <Block
            key={block.id}
            blocksState={editingTargetBlocks}
            editorRef={editorRef}
            setBlocksState={changeBlocksState}
            path={block.id}
            offset={{
              x: offsetX,
              y: 10,
            }}
          />
        ))}
      </g>
    </g>
  )
}
