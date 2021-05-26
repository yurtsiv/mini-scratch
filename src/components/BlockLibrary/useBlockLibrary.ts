import { blockDefaultWidth } from 'components/Block/Variants/const'
import { BLOCK_HEIGHT } from 'components/Block/const'
import { BlockDragState } from 'components/Block/dragListeners'
import { useSvgScroll } from 'lib/hooks/useSvgScroll'
import { Coords } from 'lib/types'
import { sortBy } from 'lodash'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  BlockPath,
  blocksState as blocksStateRecoil,
  editingTargetState,
} from 'state/scriptEditor'

export function useBlockLibrary() {
  const [highlighted, setHighlghited] = useState(false)
  const editingTarget = useRecoilValue(editingTargetState)
  const [blocksState, setBlocksState] = useRecoilState(blocksStateRecoil)
  const blockLibRef = useRef<SVGGElement>(null)

  const editingTargetBlocks = blocksState[editingTarget]

  const { blocks: libraryBlocks } = useMemo(
    () =>
      sortBy(
        Object.values(editingTargetBlocks ?? {}).filter(
          (block) => !!block.libraryBlock
        ),
        'index'
      ).reduce(
        (acc: any, nextBlock) => {
          acc.blocks.push([nextBlock, acc.offset])
          acc.offset += blockDefaultWidth[nextBlock.variant] + 3
          return acc
        },
        { blocks: [], offset: 0 }
      ),
    [editingTargetBlocks]
  )

  useLayoutEffect(() => {
    function onDragWithin(path: BlockPath) {
      if (!BlockDragState.blockToRemove) {
        setHighlghited(true)
        BlockDragState.blockToRemove = path
      }
    }

    function onDragEnd() {
      if (BlockDragState.blockToRemove) {
        setHighlghited(false)
        BlockDragState.blockToRemove = null
      }
    }

    function onDragOutside() {
      onDragEnd()
    }

    const libRect = (blockLibRef.current as SVGGElement).getBoundingClientRect()

    function onDrag(coords: Coords, path: BlockPath) {
      if (coords.y > libRect.top - BLOCK_HEIGHT / 2) {
        onDragWithin(path)
      } else if (highlighted) {
        onDragOutside()
      }
    }

    const onDragHandle = BlockDragState.onDrag(onDrag)
    const onDragEndHandle = BlockDragState.onDragEnd(onDragEnd)

    return () => {
      BlockDragState.removeOnDrag(onDragHandle)
      BlockDragState.removeOnDragEnd(onDragEndHandle)
      BlockDragState.blockToRemove = null
    }
  }, [highlighted, setBlocksState])

  const { scrollX } = useSvgScroll({ elemRef: blockLibRef })

  return {
    editingTarget,
    editingTargetBlocks,
    setBlocksState,
    libraryBlocks,
    blockLibRef,
    highlighted,
    scrollX,
  }
}
