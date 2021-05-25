import { Block } from 'components/Block/Block'
import React, { RefObject } from 'react'

import './style.css'
import { useBlockLibrary } from './useBlockLibrary'

type Props = {
  editorRef: RefObject<SVGElement>
}

const BLOCK_WIDTH = 110

export function BlockLibrary({ editorRef }: Props) {
  const {
    blockLibRef,
    blocksState,
    setBlocksState,
    libraryBlocks,
    highlighted,
    scrollX,
  } = useBlockLibrary()

  return (
    <g className="block-lib-container" ref={blockLibRef}>
      <rect width="100%" height="80" fill={highlighted ? 'red' : '#eee'} />
      <g transform={`translate(${scrollX}, 0)`}>
        {libraryBlocks.map((block, idx) => (
          <Block
            key={block.id}
            blocksState={blocksState}
            editorRef={editorRef}
            setBlocksState={setBlocksState}
            path={block.id}
            offset={{
              x: idx * BLOCK_WIDTH,
              y: 10,
            }}
          />
        ))}
      </g>
    </g>
  )
}
