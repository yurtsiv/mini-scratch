import { Block } from 'components/Block/Block'
import { cloneDeep } from 'lodash'
import React, { RefObject } from 'react'

import './style.css'
import { useBlockLibrary } from './useBlockLibrary'

type Props = {
  editorRef: RefObject<SVGElement>
}

export function BlockLibrary({ editorRef }: Props) {
  const {
    editingTarget,
    blockLibRef,
    editingTargetBlocks,
    setBlocksState,
    libraryBlocks,
    highlighted,
    scrollX,
  } = useBlockLibrary()

  function changeBlocksState(newStateGetter: any) {
    setBlocksState((origState) => {
      const state = cloneDeep(origState)
      state[editingTarget] = newStateGetter(origState[editingTarget])
      return state
    })
  }

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
