import { useRefState } from 'lib/hooks/useRefState'
import { Coords } from 'lib/types'
import { cloneDeep, get, unset } from 'lodash'
import { useCallback, useRef, useState, useEffect, RefObject } from 'react'
import { SetterOrUpdater } from 'recoil'
import { Block } from 'state/scriptEditor'

type Params = {
  setEditorState: SetterOrUpdater<Block[]>
  path: string
}

type Return = {
  draggingCoords: Coords
  ref: RefObject<SVGPathElement>
  dragging: boolean
}

export function useBlock({ setEditorState, path }: Params): Return {
  const [
    draggingCoordsRef,
    draggingCoords,
    setDraggingCoords,
  ] = useRefState<Coords>({ x: -1, y: -1 })
  const touchPointWithinElemRef = useRef({ x: -1, y: -1 })
  const [dragging, setDragging] = useState(false)

  const elementRef = useRef<SVGPathElement>(null)

  const activate = useCallback(
    (e: TouchEvent) => {
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
      setDragging(true)
    },
    [touchPointWithinElemRef, setDraggingCoords]
  )

  const deactivate = useCallback(() => {
    const nestedBlock = path.length > 1
    if (nestedBlock) {
      console.log('DEACTIVATING', path)
      setEditorState((stateOrig) => {
        const state = cloneDeep(stateOrig)
        const block = get(state, path) as Block
        block.coords = draggingCoordsRef.current as Coords
        state.push(block)
        unset(state, path)
        return state
      })
    } else {
      setEditorState((stateOrig) => {
        const state = cloneDeep(stateOrig)
        const block = get(state, path) as Block
        block.coords = draggingCoordsRef.current as Coords
        return state
      })

      setDragging(false)
    }
  }, [setDragging, path, setEditorState, draggingCoordsRef])

  useEffect(() => {
    return () => {
      console.log('COMPONENT DESTROYED', path)
    }
  }, [path])

  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      console.log('TOUCH MOVE', path)
      const { clientX: touchX, clientY: touchY } = e.touches[0]

      const coords = {
        x: touchX - touchPointWithinElemRef.current.x,
        y: touchY - touchPointWithinElemRef.current.y,
      }

      setDraggingCoords(coords)
    }

    function onTouchStart(e: TouchEvent) {
      console.log('TOUCH START', path)
      activate(e)
    }

    function onTouchEnd() {
      console.log('TOUCH END', path)
      deactivate()
    }

    function onTouchCancel() {
      setDragging(false)
    }

    const svgPath = elementRef.current

    console.log('USE EFFECT', path)
    if (svgPath) {
      console.log('REGISTERING LISTENERS', path)
      svgPath.addEventListener('touchmove', onTouchMove)
      svgPath.addEventListener('touchstart', onTouchStart)
      svgPath.addEventListener('touchend', onTouchEnd)
      svgPath.addEventListener('touchcancel', onTouchCancel)
    }

    return () => {
      if (svgPath) {
        console.log('REMOVING LISTENERS', path)
        svgPath.removeEventListener('touchmove', onTouchMove)
        svgPath.removeEventListener('touchstart', onTouchStart)
        svgPath.removeEventListener('touchend', onTouchEnd)
        svgPath.addEventListener('touchcancel', onTouchCancel)
      }
    }
  }, [activate, deactivate, path, setDraggingCoords, elementRef])

  return {
    ref: elementRef,
    draggingCoords,
    dragging,
  }
}
