import React, { useRef } from 'react'

export const getSpriteUrl = (md5Ext: string) =>
  `https://cdn.assets.scratch.mit.edu/internalapi/asset/${md5Ext}/get/`

type Props = {
  sprite: any
  onSpriteSelected: (item: any) => void
}

export function SpriteItem({ sprite, onSpriteSelected }: Props) {
  const movedRef = useRef(false)

  return (
    <img
      data-testid="sprite-item"
      className="sprite-item"
      alt={`sprite-${sprite}`}
      src={getSpriteUrl(sprite.costumes[0].md5ext)}
      onTouchMove={() => (movedRef.current = true)}
      onTouchEnd={() => {
        if (!movedRef.current) {
          onSpriteSelected(sprite)
        }

        movedRef.current = false
      }}
      onTouchCancel={() => (movedRef.current = false)}
    />
  )
}
