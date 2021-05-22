import { SPRITES } from 'lib/sprites'
import { useVM } from 'lib/vm'
import React from 'react'

import { SpriteItem } from './SpriteItem'

import './styles.css'

export function SpriteLibrary() {
  const vm = useVM()

  function onSpriteSelected(item: any) {
    const json = JSON.stringify(item)
    vm.addSprite(json)
  }

  return (
    <div className="sprites-container">
      {SPRITES.map((sprite) => (
        <SpriteItem
          key={sprite.name}
          onSpriteSelected={onSpriteSelected}
          sprite={sprite}
        />
      ))}
    </div>
  )
}
