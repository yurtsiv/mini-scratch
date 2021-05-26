import { Block } from 'components/Block/Block'
import { BlockLibrary } from 'components/BlockLibrary'
import { refreshVmProject } from 'lib/translateBlocks'
import { useVM } from 'lib/vm'
import { cloneDeep, isEmpty } from 'lodash'
import React, { useCallback, useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'
import {
  blocksState as blocksStateRecoil,
  easterEggOnState,
  editingTargetState,
  LIBRARY_BLOCKS,
  TargetBlocksState,
} from 'state/scriptEditor'

import { EditingTargetPreview } from './EditingTargetPreview'
import { ResetEasterEggBtn } from './ResetEasterEggBtn'

import './style.css'

export function ScriptEditor() {
  const editorRef = useRef(null)
  const vm = useVM()
  const [editingTarget, setEditingTarget] = useRecoilState(editingTargetState)
  const [blocksState, setBlocksState] = useRecoilState(blocksStateRecoil)
  const [easterEggOn] = useRecoilState(easterEggOnState)
  const editingTargetBlocks = blocksState[editingTarget]

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

  const onWorkspaceUpdate = useCallback(() => {
    if (!vm || vm.editingTarget.isStage) {
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
  }, [setEditingTarget, setBlocksState, blocksState, vm])

  useEffect(() => {
    onWorkspaceUpdate()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (!vm) {
      return () => {}
    }

    vm.on('workspaceUpdate', onWorkspaceUpdate)

    if (editingTargetBlocks) {
      refreshVmProject(editingTargetBlocks as TargetBlocksState, vm)
    }

    return () => {
      vm.removeListener('workspaceUpdate', onWorkspaceUpdate)
    }
  }, [
    blocksState,
    setBlocksState,
    editingTargetBlocks,
    vm,
    setEditingTarget,
    onWorkspaceUpdate,
  ])

  if (easterEggOn) {
    return (
      <div className="script-editor-container">
        <ResetEasterEggBtn />
      </div>
    )
  }

  if (!editingTarget || isEmpty(editingTargetBlocks)) {
    return (
      <div className="script-editor-container">
        <h2>Select target</h2>
      </div>
    )
  }

  return (
    <div className="script-editor-container">
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
    </div>
  )
}
