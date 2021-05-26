import { useRefState } from 'lib/hooks/useRefState'
import { Coords } from 'lib/types'
import { RefObject, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { Block, BlockPath, draggingState, DropDir } from 'state/scriptEditor'

import { BLOCK_HEIGHT } from './const'
import { BlockDragState } from './dragListeners'
import { getSuggestDropDir } from './utils'

export function useSuggestDrop({
  block,
  path,
  elementRef,
  setBlocksState,
}: {
  block: Block
  path: BlockPath
  elementRef: RefObject<SVGPathElement>
  setBlocksState: (newState: any) => void
}) {
  const [
    suggestDropRef,
    suggestDrop,
    setSuggestDrop,
  ] = useRefState<null | DropDir>(null)

  const [{ isDragging, draggedBlockPath }] = useRecoilState(draggingState)

  // check if a block is being dragged over the current block
  useEffect(() => {
    if (
      !isDragging ||
      path.startsWith(draggedBlockPath) ||
      block.libraryBlock
    ) {
      return () => {}
    }

    const firstBlockInTheGroup = path.split('.').length === 1

    function onTouchMove(draggedBlockCoords: Coords) {
      const currBlockCoords = elementRef.current?.getBoundingClientRect() as DOMRect
      const suggestDropDir = getSuggestDropDir(
        draggedBlockCoords,
        suggestDropRef.current === null ||
          suggestDropRef.current === DropDir.Bottom
          ? currBlockCoords
          : { x: currBlockCoords.x, y: currBlockCoords.y - BLOCK_HEIGHT },
        firstBlockInTheGroup
      )

      if (suggestDropDir !== null && suggestDropRef.current === null) {
        setSuggestDrop(suggestDropDir)
        BlockDragState.dropSuggestion = {
          dropDir: suggestDropDir,
          blockPath: path,
        }
      } else if (suggestDropDir === null && suggestDropRef.current !== null) {
        setSuggestDrop(null)
        BlockDragState.dropSuggestion = null
      }
    }

    const listenerHandle = BlockDragState.onDrag(onTouchMove)

    return () => {
      BlockDragState.removeOnDrag(listenerHandle)
      BlockDragState.dropSuggestion = null
      setSuggestDrop(null)
    }
  }, [
    block,
    setBlocksState,
    isDragging,
    setSuggestDrop,
    suggestDropRef,
    elementRef,
    draggedBlockPath,
    path,
  ])

  return {
    suggestDrop,
  }
}
