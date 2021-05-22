import { SPRITES } from 'lib/sprites'
import React from 'react'

import { SpriteItem } from './SpriteItem'

import './styles.css'

type Props = {
  vm: any
}

export function SpriteLibrary({ vm }: Props) {
  async function onSpriteSelected(item: any) {
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
