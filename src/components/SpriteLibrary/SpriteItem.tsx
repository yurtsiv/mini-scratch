import React from 'react'

export const getSpriteUrl = (md5Ext: string) =>
  `https://cdn.assets.scratch.mit.edu/internalapi/asset/${md5Ext}/get/`

type Props = {
  sprite: any
  onSpriteSelected: (item: any) => void
}

export function SpriteItem({
  sprite,
  onSpriteSelected: onItemSelected,
}: Props) {
  return (
    <img
      className="sprite-item"
      alt={`sprite-${sprite}`}
      src={getSpriteUrl(sprite.costumes[0].md5ext)}
      onTouchStart={() => onItemSelected(sprite)}
    />
  )
}
