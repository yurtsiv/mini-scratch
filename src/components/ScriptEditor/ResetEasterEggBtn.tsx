import { INITIAL_PROJECT } from 'lib/initialProject'
import { useVM } from 'lib/vm'
import React from 'react'
import { useRecoilState } from 'recoil'
import { easterEggOnState } from 'state/scriptEditor'

export function ResetEasterEggBtn() {
  const vm = useVM()
  const [, setEasterEggOn] = useRecoilState(easterEggOnState)

  function resetEasterEgg() {
    vm.loadProject(INITIAL_PROJECT).then(() => setEasterEggOn(false))
  }

  return (
    <button className="reset-easter-egg-btn" onClick={() => resetEasterEgg()}>
      BACK TO NORMAL
    </button>
  )
}
