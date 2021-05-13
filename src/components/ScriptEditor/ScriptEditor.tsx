import { Block } from 'components/Blocks/Block'
import React, { useRef } from 'react'
import { useRecoilState } from 'recoil'
import { blocksState } from 'state/scriptEditor'

export function ScriptEditor() {
  const editorRef = useRef(null)
  const [state, setState] = useRecoilState(blocksState)
  console.log('EDITOR STATE', state)

  return (
    <svg ref={editorRef} width="100%" height="300px">
      {state.map((block, i) => (
        <Block
          editorRef={editorRef}
          key={block.id}
          blocksState={state}
          setBlocksState={setState}
          path={`${i}`}
        />
      ))}
    </svg>
  )
}
