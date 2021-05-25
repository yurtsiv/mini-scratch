import { BLOCK_HEIGHT } from 'components/Block/const'
import { BlockDragState } from 'components/Block/dragListeners'
import { useSvgScroll } from 'lib/hooks/useSvgScroll'
import { Coords } from 'lib/types'
import { sortBy } from 'lodash'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { BlockPath, blocksState as blocksStateRecoil } from 'state/scriptEditor'

export function useBlockLibrary() {
  const [highlighted, setHighlghited] = useState(false)
  const [blocksState, setBlocksState] = useRecoilState(blocksStateRecoil)
  const blockLibRef = useRef<SVGGElement>(null)

  const libraryBlocks = useMemo(
    () =>
      sortBy(
        Object.values(blocksState).filter((block) => !!block.libraryBlock),
        'index'
      ),
    [blocksState]
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
    blocksState,
    setBlocksState,
    libraryBlocks,
    blockLibRef,
    highlighted,
    scrollX,
  }
}
