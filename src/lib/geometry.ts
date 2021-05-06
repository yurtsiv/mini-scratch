import { Block, BlockType } from 'state/scriptEditor'

import { BLOCK_HEIGHT, OVERLAP_BOX_HEIGHT, OVERLAP_BOX_WIDTH } from './const'
import { Coords } from './types'

function blockOverlapBox(block: Block) {
  let blockDepth = 0
  let next: Block | undefined = block
  while (next) {
    if (next.type !== BlockType.Ghost) {
      blockDepth += 1
    }
    next = next.next
  }

  const topY = block.coords.y + OVERLAP_BOX_HEIGHT
  const bottomY = BLOCK_HEIGHT + blockDepth + OVERLAP_BOX_HEIGHT
  const overlapBoxHalfWidth = OVERLAP_BOX_WIDTH / 2
  const leftX = block.coords.x - overlapBoxHalfWidth
  const rightX = block.coords.x + overlapBoxHalfWidth

  return { leftX, rightX, topY, bottomY }
}

export function overlapsWithBlock(block: Block, coords: Coords) {
  const { leftX, rightX, topY, bottomY } = blockOverlapBox(block)

  const r =
    (coords.x >= leftX || coords.y <= rightX) &&
    (coords.y >= topY || coords.y <= bottomY)

  // if (r) {
  //   debugger
  // }

  return r
}

export function findJoinPath(
  initialPath: string,
  block: Block,
  coords: Coords
): string | null {
  let path = initialPath
  let prevCoords = block.coords
  let next: Block | undefined = block
  while (next) {
    if (next.type !== BlockType.Ghost) {
      const dist = Math.abs(prevCoords.y - coords.y)
      if (dist < BLOCK_HEIGHT) {
        return path
      }
    }

    prevCoords = next?.coords
    path += '.next'
    next = next.next
  }

  return null
}
