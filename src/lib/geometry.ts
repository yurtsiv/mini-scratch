import { Block, BlockType } from 'state/scriptEditor'

import { BLOCK_HEIGHT, OVERLAP_BOX_HEIGHT, OVERLAP_BOX_WIDTH } from './const'
import { Coords } from './types'

function blockOverlapBox(block: Block, skipLast: boolean) {
  let blockDepth = 0
  let next: Block | undefined = block
  while (next) {
    if (next.type !== BlockType.Ghost) {
      blockDepth += 1
    }
    next = next.next
  }

  if (skipLast) {
    blockDepth -= 1
  }

  const topY = block.coords.y - OVERLAP_BOX_HEIGHT
  const bottomY = BLOCK_HEIGHT * blockDepth + OVERLAP_BOX_HEIGHT
  const overlapBoxHalfWidth = OVERLAP_BOX_WIDTH / 2
  const leftX = block.coords.x - overlapBoxHalfWidth
  const rightX = block.coords.x + overlapBoxHalfWidth

  return { leftX, rightX, topY, bottomY }
}

export function overlapsWithBlock(
  block: Block,
  coords: Coords,
  skipLast: boolean
) {
  const { leftX, rightX, topY, bottomY } = blockOverlapBox(block, skipLast)

  const r =
    coords.x >= leftX &&
    coords.x <= rightX &&
    coords.y >= topY &&
    coords.y <= bottomY

  // console.log(leftX, rightX, topY, bottomY, coords)
  // console.log('OVERLAPS', r)

  return r
}

export function findJoinPath(
  initialPath: string,
  block: Block,
  coords: Coords,
  skipLast: boolean
): string | null {
  let path = initialPath
  let prevY = block.coords.y
  let next: Block | undefined = block

  while (next) {
    if (skipLast && !next.next) {
      return null
    }

    if (next.type !== BlockType.Ghost) {
      const dist = Math.abs(prevY - coords.y)
      if (dist < BLOCK_HEIGHT + OVERLAP_BOX_HEIGHT) {
        return path
      }
    }

    prevY += next?.coords.y + BLOCK_HEIGHT
    path += '.next'
    next = next.next
  }

  return null
}
