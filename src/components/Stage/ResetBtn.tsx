import { ResetIcon } from 'components/Icons/ResetIcon'
import { INITIAL_PROJECT } from 'lib/initialProject'
import { useVM } from 'lib/vm'
import React from 'react'
import { useRecoilState } from 'recoil'
import {
  blocksState,
  easterEggOnState,
  LIBRARY_BLOCKS,
} from 'state/scriptEditor'

export function ResetBtn() {
  const vm = useVM()
  const [, setBlocksState] = useRecoilState(blocksState)
  const [easterEggOn] = useRecoilState(easterEggOnState)

  if (easterEggOn) {
    return null
  }

  function onReset() {
    vm.loadProject(INITIAL_PROJECT).then(() => {
      setBlocksState(() => ({
        [vm.editingTarget.id]: {
          ...LIBRARY_BLOCKS,
        },
      }))
    })
  }

  return <ResetIcon className="reset-btn" onTouchStart={onReset} />
}
