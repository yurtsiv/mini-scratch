import { getSpriteUrl } from 'components/SpriteLibrary/SpriteItem'
import { useVM } from 'lib/vm'
import React from 'react'
import { useRecoilValue } from 'recoil'
import { editingTargetState } from 'state/scriptEditor'

export function EditingTargetPreview() {
  const vm = useVM()
  const editingTarget = useRecoilValue(editingTargetState)

  if (!vm || !editingTarget) {
    return null
  }

  const assetMd5 = vm.runtime.targets.find((t: any) => t.id === editingTarget)
    .sprite.costumes_[0].md5

  return (
    <img
      className="editing-target-preview"
      alt="editing-target-preview"
      src={getSpriteUrl(assetMd5)}
    />
  )
}
