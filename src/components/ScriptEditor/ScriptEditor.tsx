import { Block } from 'components/Block/Block'
import { BlockLibrary } from 'components/BlockLibrary'
import { refreshVmProject } from 'lib/translateBlocks'
import { useVM } from 'lib/vm'
import React, { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'
import {
  blocksState as blocksStateRecoil,
  editingTargetState,
} from 'state/scriptEditor'

import { EditingTargetPreview } from './EditingTargetPreview'

import './style.css'

export function ScriptEditor() {
  const editorRef = useRef(null)
  const vm = useVM()
  const [, setEditingTarget] = useRecoilState(editingTargetState)
  const [blocksState, setBlocksState] = useRecoilState(blocksStateRecoil)

  useEffect(() => {
    if (!vm) {
      return
    }

    vm.on('workspaceUpdate', () => {
      if (!vm.editingTarget.isStage) {
        setEditingTarget(vm.editingTarget.id)
      }
    })

    refreshVmProject(blocksState, vm)
  }, [blocksState, vm, setEditingTarget])

  return (
    <>
      <EditingTargetPreview />
      <svg ref={editorRef} width="100%" height="100%">
        {Object.entries(blocksState).map(
          ([path, block]) =>
            !block.libraryBlock && (
              <Block
                editorRef={editorRef}
                key={block.id}
                blocksState={blocksState}
                setBlocksState={setBlocksState}
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
