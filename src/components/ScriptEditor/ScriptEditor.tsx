import { Block } from 'components/Block/Block'
import React, { useRef } from 'react'
import { useRecoilState } from 'recoil'
import { blocksState } from 'state/scriptEditor'

export function ScriptEditor() {
  const editorRef = useRef(null)
  const [state, setState] = useRecoilState(blocksState)

  return (
    <>
      <svg ref={editorRef} width="100%" height="100%">
        {state.map((block, i) => (
          <Block
            editorRef={editorRef}
            key={block.id}
            blocksState={state}
            setBlocksState={setState}
            path={`${i}`}
            offset={null}
          />
        ))}
      </svg>
    </>
  )
}
