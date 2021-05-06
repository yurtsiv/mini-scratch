import { Block } from 'components/Blocks/Block'
import React, { useRef } from 'react'
import { useRecoilState } from 'recoil'
import { scriptEditorState } from 'state/scriptEditor'

export function ScriptEditor() {
  const editorRef = useRef(null)
  const [state, setState] = useRecoilState(scriptEditorState)
  console.log('EDITOR STATE', state)

  return (
    <svg ref={editorRef} width="100%" height="300px">
      {state.map((block, i) => (
        <Block
          editorRef={editorRef}
          key={block.id}
          editorState={state}
          setEditorState={setState}
          path={`${i}`}
        />
      ))}
    </svg>
  )
}
