import { Coords } from 'lib/types'
import { cloneDeep, get, set, unset } from 'lodash'
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

function createNewLibraryBlock(
  state: BlocksState,
  block: Block,
  path: BlockPath
) {
  const newLibBlock = cloneDeep(block)
  newLibBlock.id = Date.now()
  newLibBlock.next = undefined
  const blockIdx = parseInt(path)
  state.splice(blockIdx + 1, 0, newLibBlock)

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
  const destinationBlock = get(state, dropInfo?.blockPath ?? '')

  unset(state, path)

  if (dropInfo?.dropDir === DropDir.Top) {
    block.coords = {
      x: destinationBlock.coords.x,
      y: destinationBlock.coords.y - BLOCK_HEIGHT,
    }

    unset(destinationBlock, 'coords')
    lastBlockInCurrentGroup.next = destinationBlock
    set(state, dropInfo.blockPath, block)
  } else {
    unset(block, 'coords')
    if (destinationBlock.next) {
      lastBlockInCurrentGroup.next = destinationBlock.next
    }
    destinationBlock.next = block
  }

  return state.filter(Boolean)
}

export function updateStateOnDragEnd(state: BlocksState, path: BlockPath) {
  const block = get(state, path)

  if (block.libraryBlock) {
    createNewLibraryBlock(state, block, path)
  }

  if (BlockDragState.dropSuggestion) {
    return snapBlockIntoSuggestedPlace(state, block, path)
  }

  if (BlockDragState.blockToRemove) {
    unset(state, BlockDragState.blockToRemove as string)
    return state.filter(Boolean)
  }

  const nestedBlock = path.split('.').length > 1

  if (nestedBlock) {
    block.coords = BlockDragState.dragCoords as Coords
    state.push(block)
    unset(state, path)
  } else {
    block.coords = BlockDragState.dragCoords as Coords
  }

  return state
}
