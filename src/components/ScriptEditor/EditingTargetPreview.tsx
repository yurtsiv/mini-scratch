import { getSpriteUrl } from 'components/SpriteLibrary/SpriteItem'
import { useVM } from 'lib/vm'
import React, { useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { easterEggOnState, editingTargetState } from 'state/scriptEditor'

export function EditingTargetPreview() {
  const vm = useVM()
  const editingTarget = useRecoilValue(editingTargetState)
  const [, setEasterEggOn] = useRecoilState(easterEggOnState)

  const clickCountRef = useRef(0)

  function onClick() {
    clickCountRef.current += 1

    if (clickCountRef.current === 10) {
      vm.downloadProjectId('6')
      setEasterEggOn(true)
      clickCountRef.current = 0
    }
  }

  if (!vm || !editingTarget) {
    return null
  }

  const assetMd5 = vm.runtime.targets.find((t: any) => t.id === editingTarget)
    .sprite.costumes_[0].md5

  return (
    <img
      onTouchStart={onClick}
      className="editing-target-preview"
      alt="editing-target-preview"
      src={getSpriteUrl(assetMd5)}
    />
  )
}
