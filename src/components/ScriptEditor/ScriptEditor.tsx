import { Block } from 'components/Block/Block'
import { BlockLibrary } from 'components/BlockLibrary'
import React, { useRef } from 'react'
import { useRecoilState } from 'recoil'
import { blocksState } from 'state/scriptEditor'

export function ScriptEditor() {
  const editorRef = useRef(null)
  const [state, setState] = useRecoilState(blocksState)
  console.log('EDITOR STATE', state)

  return (
    <>
      <svg ref={editorRef} width="100%" height="100%">
        {Object.entries(state).map(
          ([path, block]) =>
            !block.libraryBlock && (
              <Block
                editorRef={editorRef}
                key={block.id}
                blocksState={state}
                setBlocksState={setState}
                path={path}
                offset={null}
              />
            )
        )}
        <BlockLibrary editorRef={editorRef} />
      </svg>
    </>
  )
}
