import { useRefState } from 'lib/hooks/useRefState'
import { Coords } from 'lib/types'
import { cloneDeep } from 'lodash'
import { useRef, useLayoutEffect, RefObject } from 'react'
import { useRecoilState } from 'recoil'
import {
  Block,
  draggingState,
  DropDir,
  TargetBlocksState,
} from 'state/scriptEditor'

import { BlockDragState } from './dragListeners'
import { useSuggestDrop } from './useSuggestDrop'
import { updateStateOnDragEnd } from './utils'

type Params = {
  editorRef: any
  blocksState: TargetBlocksState
  block: Block
  setBlocksState: (newState: any) => void
  path: string
}

type Return = {
  draggingCoords: Coords | null
  ref: RefObject<SVGPathElement>
  suggestDrop: DropDir | null
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
  const [, setDraggingState] = useRecoilState(draggingState)

  const { suggestDrop } = useSuggestDrop({
    block,
    path,
    elementRef,
    setBlocksState,
  })

  useLayoutEffect(() => {
    function onTouchMove(e: TouchEvent) {
      e.stopPropagation()

      const { clientX: touchX, clientY: touchY } = e.touches[0]

      if (!draggingCoordsRef.current) {
        setDraggingState({
          isDragging: true,
          draggedBlockPath: path,
        })
      }

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
      BlockDragState.dragCoords = relativeCoords
      BlockDragState.notifyOnDrag(globalCoords, path)
    }

    function onTouchStart(e: TouchEvent) {
      e.stopPropagation()

      // sometimes this function is called twice
      if (touchPointWithinElemRef.current) {
        return
      }

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

      setBlocksState((state) => updateStateOnDragEnd(cloneDeep(state), path))
      setDraggingState({
        isDragging: false,
        draggedBlockPath: '',
      })

      BlockDragState.notifyOnDragEnd()
      BlockDragState.dragCoords = null
      touchPointWithinElemRef.current = null
      setDraggingCoords(null)
    }

    function onTouchCancel() {
      onTouchEnd()
    }

    setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.addEventListener('touchmove', onTouchMove, {
          passive: true,
        })
        elementRef.current.addEventListener('touchstart', onTouchStart, {
          passive: true,
        })
        elementRef.current.addEventListener('touchend', onTouchEnd, {
          passive: true,
        })
        elementRef.current.addEventListener('touchcancel', onTouchCancel, {
          passive: true,
        })
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
    setDraggingState,
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
