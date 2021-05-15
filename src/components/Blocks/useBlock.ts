import { BLOCK_HEIGHT } from 'lib/const'
import { useRefState } from 'lib/hooks/useRefState'
import { Coords } from 'lib/types'
import { cloneDeep, get, set, unset } from 'lodash'
import { useRef, useEffect, RefObject, useState, useMemo } from 'react'
import { SetterOrUpdater, useRecoilState } from 'recoil'
import {
  Block,
  BlocksState,
  draggingState,
  BlockPath,
} from 'state/scriptEditor'

type Params = {
  blocksState: BlocksState
  setBlocksState: SetterOrUpdater<Block[]>
  path: string
}

export enum DropDir {
  Top,
  Bottom,
}

type Return = {
  draggingCoords: Coords | null
  ref: RefObject<SVGPathElement>
  suggestDrop: DropDir | null
}

const dragListeners: any = {}

function useSuggestDrop({
  path,
  elementRef,
}: {
  path: BlockPath
  elementRef: RefObject<SVGPathElement>
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
      const currBlockCoords = elementRef.current?.getBoundingClientRect() as DOMRect
      const currBlockY = suggestDropRef.current
        ? currBlockCoords.y + BLOCK_HEIGHT
        : currBlockCoords.y

      console.log(suggestDropRef)
      if (
        Math.abs(draggedBlockCoords.y - currBlockY) <= BLOCK_HEIGHT / 2 - 10 &&
        !suggestDropRef.current
      ) {
        console.log('SETTING')
        setSuggestDrop(DropDir.Top)
      } else if (suggestDropRef.current !== null) {
        console.log('UNSETTING')
        setSuggestDrop(null)
      }
    }

    const listenerKey = Symbol('list-key')
    dragListeners[listenerKey] = onTouchMove

    return () => {
      setSuggestDrop(null)
      delete dragListeners[listenerKey]
    }
  }, [
    isDragging,
    setSuggestDrop,
    suggestDropRef,
    elementRef,
    draggedBlockPath,
    path,
  ])

  const { onDragStart, onDragEnd } = useMemo(
    () => ({
      onDragStart: () => {
        setDraggingState({ isDragging: true, draggedBlockPath: path })
      },
      onDragEnd: () => {
        setDraggingState({ isDragging: false, draggedBlockPath: '' })
      },
    }),
    [setDraggingState, path]
  )

  return {
    suggestDrop,
    onDragStart,
    onDragEnd,
  }
}

export function useBlock({
  blocksState,
  setBlocksState,
  path,
}: Params): Return {
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
      onDragEnd()

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
