import { BLOCK_HEIGHT } from 'lib/const'
import { useRefState } from 'lib/hooks/useRefState'
import { Coords } from 'lib/types'
import { cloneDeep, get, unset, set } from 'lodash'
import { useRef, useEffect, RefObject, useMemo } from 'react'
import { SetterOrUpdater, useRecoilState } from 'recoil'
import {
  Block,
  BlocksState,
  draggingState,
  BlockPath,
  DropDir,
} from 'state/scriptEditor'

type Params = {
  blocksState: BlocksState
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

function useSuggestDrop({
  path,
  elementRef,
  setBlocksState,
}: {
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

    function onTouchMove(draggedBlockCoords: Coords) {
      console.log('TOUCH MOVE')
      const currBlockCoords = elementRef.current?.getBoundingClientRect() as DOMRect
      const currBlockY =
        suggestDropRef.current === null
          ? currBlockCoords.y
          : currBlockCoords.y - BLOCK_HEIGHT

      const isCloseEnough =
        Math.abs(draggedBlockCoords.y - currBlockY) <= BLOCK_HEIGHT / 2 - 5
      if (isCloseEnough && suggestDropRef.current === null) {
        setSuggestDrop(DropDir.Top)

        dropInfo = {
          dropDir: DropDir.Top,
          blockPath: path,
        }
      } else if (!isCloseEnough && suggestDropRef.current !== null) {
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
        console.log('DRAG END', dropInfo)
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
            if (destinationBlock.coords) {
              currBlock.coords = destinationBlock.coords
              destinationBlock.coords = null
            } else {
              currBlock.coords = null
            }

            lastBlockInCurrentGroup.next = destinationBlock
            set(state, dropInfo.blockPath, currBlock)
          } else {
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

export function useBlock({ setBlocksState, path }: Params): Return {
  const [
    draggingCoordsRef,
    draggingCoords,
    setDraggingCoords,
  ] = useRefState<Coords | null>(null)
  const touchPointWithinElemRef = useRef<Coords>({ x: -1, y: -1 })

  const elementRef = useRef<SVGPathElement>(null)

  const { onDragStart, onDragEnd, suggestDrop } = useSuggestDrop({
    path,
    elementRef,
    setBlocksState,
  })

  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      const { clientX: touchX, clientY: touchY } = e.touches[0]

      const coords = {
        x: touchX - touchPointWithinElemRef.current.x,
        y: touchY - touchPointWithinElemRef.current.y,
      }

      setDraggingCoords(coords)
      Reflect.ownKeys(dragListeners).forEach((key) =>
        dragListeners[key](coords)
      )
    }

    function onTouchStart(e: TouchEvent) {
      onDragStart()
      const elemPos = (e.target as SVGPathElement).getBoundingClientRect()
      const { clientX: touchX, clientY: touchY } = e.touches[0]

      touchPointWithinElemRef.current = {
        x: touchX - elemPos.x,
        y: touchY - elemPos.y,
      }

      const coords = {
        x: touchX - touchPointWithinElemRef.current.x,
        y: touchY - touchPointWithinElemRef.current.y,
      }

      setDraggingCoords(coords)
    }

    function onTouchEnd() {
      const dropped = onDragEnd()

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

        setDraggingCoords(null)
      }
    }

    function onTouchCancel() {
      onTouchEnd()
    }

    const svgPath = elementRef.current

    if (svgPath) {
      svgPath.addEventListener('touchmove', onTouchMove)
      svgPath.addEventListener('touchstart', onTouchStart)
      svgPath.addEventListener('touchend', onTouchEnd)
      svgPath.addEventListener('touchcancel', onTouchCancel)
    }

    return () => {
      if (svgPath) {
        svgPath.removeEventListener('touchmove', onTouchMove)
        svgPath.removeEventListener('touchstart', onTouchStart)
        svgPath.removeEventListener('touchend', onTouchEnd)
        svgPath.addEventListener('touchcancel', onTouchCancel)
      }
    }
  }, [
    setBlocksState,
    onDragEnd,
    onDragStart,
    draggingCoordsRef,
    path,
    setDraggingCoords,
    elementRef,
  ])

  return {
    ref: elementRef,
    draggingCoords,
    suggestDrop,
  }
}
