import { useRefState } from 'lib/hooks/useRefState'
import { Coords } from 'lib/types'
import { cloneDeep, get, unset, set } from 'lodash'
import { useRef, useEffect, useLayoutEffect, RefObject, useMemo } from 'react'
import { SetterOrUpdater, useRecoilState } from 'recoil'
import {
  Block,
  BlocksState,
  draggingState,
  BlockPath,
  DropDir,
} from 'state/scriptEditor'

import { BLOCK_HEIGHT } from './const'

type Params = {
  editorRef: any
  blocksState: BlocksState
  block: Block
  setBlocksState: SetterOrUpdater<Block[]>
  path: string
}

type Return = {
  draggingCoords: Coords | null
  ref: RefObject<SVGPathElement>
  suggestDrop: DropDir | null
}

const dragListeners: any = {}
let dropInfo: { dropDir: DropDir; blockPath: BlockPath } | null = null

function getSuggestDropDir(
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

function useSuggestDrop({
  block,
  path,
  elementRef,
  setBlocksState,
}: {
  block: Block
  path: BlockPath
  elementRef: RefObject<SVGPathElement>
  setBlocksState: SetterOrUpdater<Block[]>
}) {
  const [
    suggestDropRef,
    suggestDrop,
    setSuggestDrop,
  ] = useRefState<null | DropDir>(null)

  const [{ isDragging, draggedBlockPath }, setDraggingState] = useRecoilState(
    draggingState
  )

  useEffect(() => {
    if (!isDragging || path.startsWith(draggedBlockPath)) {
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

        dropInfo = {
          dropDir: suggestDropDir,
          blockPath: path,
        }
      } else if (suggestDropDir === null && suggestDropRef.current !== null) {
        setSuggestDrop(null)
        dropInfo = null
      }
    }

    const listenerKey = Symbol('list-key')
    dragListeners[listenerKey] = onTouchMove

    return () => {
      delete dragListeners[listenerKey]
      setSuggestDrop(null)
      dropInfo = null
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
    setDraggingState,
  ])

  const { onDragStart, onDragEnd } = useMemo(
    () => ({
      onDragStart: () => {
        setDraggingState({
          isDragging: true,
          draggedBlockPath: path,
        })
      },
      onDragEnd: () => {
        setDraggingState({
          isDragging: false,
          draggedBlockPath: '',
        })

        if (!dropInfo) {
          return false
        }

        setBlocksState((origState) => {
          const state = cloneDeep(origState)

          const currBlock = get(state, path)
          let lastBlockInCurrentGroup = currBlock
          while (lastBlockInCurrentGroup.next) {
            lastBlockInCurrentGroup = currBlock.next
          }

          const destinationBlock = get(state, dropInfo?.blockPath ?? '')

          unset(state, path)

          if (dropInfo?.dropDir === DropDir.Top) {
            currBlock.coords = {
              x: destinationBlock.coords.x,
              y: destinationBlock.coords.y - BLOCK_HEIGHT,
            }

            unset(destinationBlock, 'coords')
            lastBlockInCurrentGroup.next = destinationBlock
            set(state, dropInfo.blockPath, currBlock)
          } else {
            unset(currBlock, 'coords')
            if (destinationBlock.next) {
              lastBlockInCurrentGroup.next = destinationBlock.next
            }
            destinationBlock.next = currBlock
          }

          return state.filter(Boolean)
        })

        return true
      },
    }),
    [setDraggingState, setBlocksState, path]
  )

  return {
    suggestDrop,
    onDragStart,
    onDragEnd,
  }
}

export function useBlock({
  editorRef,
  block,
  setBlocksState,
  path,
}: Params): Return {
  const [
    draggingCoordsRef,
    draggingCoords,
    setDraggingCoords,
  ] = useRefState<Coords | null>(null)
  const touchPointWithinElemRef = useRef<Coords | null>(null)

  const elementRef = useRef<SVGPathElement>(null)

  const { onDragStart, onDragEnd, suggestDrop } = useSuggestDrop({
    block,
    path,
    elementRef,
    setBlocksState,
  })

  useLayoutEffect(() => {
    function onTouchMove(e: TouchEvent) {
      const { clientX: touchX, clientY: touchY } = e.touches[0]

      const ctm = editorRef.current.getScreenCTM()

      const relativeX = (touchX - ctm.e) / ctm.a
      const relativeY = (touchY - ctm.f) / ctm.d

      const touchPointWithinElem = touchPointWithinElemRef.current as Coords
      const relativeCoords = {
        x: relativeX - touchPointWithinElem.x,
        y: relativeY - touchPointWithinElem.y,
      }

      const globalCoords = {
        x: touchX - touchPointWithinElem.x,
        y: touchY - touchPointWithinElem.y,
      }

      setDraggingCoords(relativeCoords)
      Reflect.ownKeys(dragListeners).forEach((key) =>
        dragListeners[key](globalCoords)
      )
    }

    function onTouchStart(e: TouchEvent) {
      // sometimes this function is called twice
      if (touchPointWithinElemRef.current) {
        return
      }

      onDragStart()
      const elemPos = (e.currentTarget as SVGPathElement).getBoundingClientRect()
      const { clientX: touchX, clientY: touchY } = e.touches[0]

      const touchPointWithinElem = {
        x: touchX - elemPos.x,
        y: touchY - elemPos.y,
      }

      touchPointWithinElemRef.current = touchPointWithinElem
    }

    function onTouchEnd() {
      if (!draggingCoordsRef.current) {
        return
      }

      const dropped = onDragEnd()

      touchPointWithinElemRef.current = null
      if (dropped) {
        setDraggingCoords(null)
        return
      }

      const nestedBlock = path.split('.').length > 1
      // create new block group
      if (nestedBlock) {
        setBlocksState((stateOrig) => {
          const state = cloneDeep(stateOrig)
          const block = get(state, path) as Block
          block.coords = draggingCoordsRef.current as Coords
          state.push(block)
          unset(state, path)
          return state
        })
      } else {
        setBlocksState((stateOrig) => {
          const state = cloneDeep(stateOrig)
          const block = get(state, path) as Block
          block.coords = draggingCoordsRef.current as Coords
          return state
        })
      }

      setDraggingCoords(null)
    }

    function onTouchCancel() {
      onTouchEnd()
    }

    setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.addEventListener('touchmove', onTouchMove)
        elementRef.current.addEventListener('touchstart', onTouchStart)
        elementRef.current.addEventListener('touchend', onTouchEnd)
        elementRef.current.addEventListener('touchcancel', onTouchCancel)
      }
    }, 0)

    const svgPath = elementRef.current
    return () => {
      if (svgPath) {
        svgPath.removeEventListener('touchmove', onTouchMove)
        svgPath.removeEventListener('touchstart', onTouchStart)
        svgPath.removeEventListener('touchend', onTouchEnd)
        svgPath.removeEventListener('touchcancel', onTouchCancel)
      }
    }
  }, [
    setBlocksState,
    onDragEnd,
    onDragStart,
    draggingCoordsRef,
    path,
    setDraggingCoords,
    block,
    editorRef,
  ])

  return {
    ref: elementRef,
    draggingCoords,
    suggestDrop,
  }
}
