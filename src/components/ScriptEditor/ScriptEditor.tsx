import { Block } from 'components/Block/Block'
import { BlockLibrary } from 'components/BlockLibrary'
import { refreshVmProject } from 'lib/translateBlocks'
import { useVM } from 'lib/vm'
import { cloneDeep, isEmpty } from 'lodash'
import React, { useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  blocksState as blocksStateRecoil,
  editingTargetBlocksState,
  editingTargetState,
  LIBRARY_BLOCKS,
  TargetBlocksState,
} from 'state/scriptEditor'

import { EditingTargetPreview } from './EditingTargetPreview'

import './style.css'

export function ScriptEditor() {
  const editorRef = useRef(null)
  const vm = useVM()
  const [editingTarget, setEditingTarget] = useRecoilState(editingTargetState)
  const editingTargetBlocks = useRecoilValue(editingTargetBlocksState)
  const [blocksState, setBlocksState] = useRecoilState(blocksStateRecoil)
  console.log(blocksState, editingTarget, editingTargetBlocks)

  function changeBlocksState(newStateGetter: any) {
    setBlocksState((origState) => {
      const state = cloneDeep(origState)
      state[editingTarget] = newStateGetter(origState[editingTarget])
      return state
    })
  }

  useEffect(() => {
    if (!vm) {
      return () => {}
    }

    function onWorkspaceUpdate() {
      if (vm.editingTarget.isStage) {
        return
      }

      const targetId = vm.editingTarget.id
      setEditingTarget(targetId)

      if (!blocksState[targetId]) {
        setBlocksState((origState) => {
          const state = cloneDeep(origState)
          state[targetId] = { ...LIBRARY_BLOCKS }
          return state
        })
      }
    }

    vm.on('workspaceUpdate', onWorkspaceUpdate)
    refreshVmProject(editingTargetBlocks as TargetBlocksState, vm)

    return () => {
      vm.removeListener('workspaceUpdate', onWorkspaceUpdate)
    }
  }, [blocksState, setBlocksState, editingTargetBlocks, vm, setEditingTarget])

  if (!editingTarget || isEmpty(editingTargetBlocks)) {
    return <h2>Select target</h2>
  }

  return (
    <>
      <EditingTargetPreview />
      <svg ref={editorRef} width="100%" height="100%">
        {Object.entries(editingTargetBlocks as TargetBlocksState).map(
          ([path, block]) =>
            !block.libraryBlock && (
              <Block
                editorRef={editorRef}
                key={block.id}
                blocksState={editingTargetBlocks as TargetBlocksState}
                setBlocksState={changeBlocksState}
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
