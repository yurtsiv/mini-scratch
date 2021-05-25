import { Coords } from 'lib/types'
import { cloneDeep, get, unset } from 'lodash'
import { Block, BlockPath, BlocksState, DropDir } from 'state/scriptEditor'

import { BLOCK_HEIGHT } from './const'
import { BlockDragState } from './dragListeners'

export function getSuggestDropDir(
  draggedBlockCoords: Coords,
  targetBlockCoords: Coords,
  firstBlockInTheGroup: boolean
): DropDir | null {
  const yDist = draggedBlockCoords.y - targetBlockCoords.y
  const xDist = draggedBlockCoords.x - targetBlockCoords.x
  const xCloseEnough = Math.abs(xDist) <= 40

  if (
    xCloseEnough &&
    firstBlockInTheGroup &&
    yDist >= -BLOCK_HEIGHT &&
    yDist <= BLOCK_HEIGHT / 2 - 5
  ) {
    return DropDir.Top
  }

  if (
    xCloseEnough &&
    yDist >= BLOCK_HEIGHT / 2 + 5 &&
    yDist <= BLOCK_HEIGHT + BLOCK_HEIGHT / 2 - 5
  ) {
    return DropDir.Bottom
  }

  return null
}

function createNewLibraryBlock(state: BlocksState, block: Block) {
  const newLibBlock = cloneDeep(block)
  newLibBlock.id = `${Date.now()}`
  state[newLibBlock.id] = newLibBlock

  block.libraryBlock = false
}

function snapBlockIntoSuggestedPlace(
  state: BlocksState,
  block: Block,
  path: BlockPath
) {
  let lastBlockInCurrentGroup = block
  while (lastBlockInCurrentGroup.next) {
    lastBlockInCurrentGroup = lastBlockInCurrentGroup.next
  }

  const dropInfo = BlockDragState.dropSuggestion
  const destinationBlock = get(state, dropInfo?.blockPath as string) as Block

  unset(state, path)

  if (dropInfo?.dropDir === DropDir.Top) {
    block.coords = {
      x: (destinationBlock.coords as Coords).x,
      y: (destinationBlock.coords as Coords).y - BLOCK_HEIGHT,
    }

    unset(destinationBlock, 'coords')
    lastBlockInCurrentGroup.next = destinationBlock
    state[block.id] = block
    unset(state, destinationBlock.id)
  } else {
    unset(block, 'coords')
    if (destinationBlock.next) {
      lastBlockInCurrentGroup.next = destinationBlock.next
    }
    destinationBlock.next = block
  }

  return state
}

export function updateStateOnDragEnd(state: BlocksState, path: BlockPath) {
  const block = get(state, path)

  if (block.libraryBlock) {
    createNewLibraryBlock(state, block)
  }

  if (BlockDragState.dropSuggestion) {
    return snapBlockIntoSuggestedPlace(state, block, path)
  }

  if (BlockDragState.blockToRemove) {
    unset(state, BlockDragState.blockToRemove as string)
    return state
  }

  const nestedBlock = path.split('.').length > 1

  if (nestedBlock) {
    block.coords = BlockDragState.dragCoords as Coords
    state[block.id] = block
    unset(state, path)
  } else {
    block.coords = BlockDragState.dragCoords as Coords
  }

  return state
}
