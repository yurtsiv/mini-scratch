import { Coords } from 'lib/types'
import { cloneDeep, get, unset } from 'lodash'
import { useCallback, useRef, useState, useEffect, RefObject } from 'react'
import { SetterOrUpdater } from 'recoil'
import { Block } from 'state/scriptEditor'

type Params = {
  setEditorState: SetterOrUpdater<Block[]>
  path: string[]
}

type Return = {
  draggingCoords: Coords
  ref: RefObject<SVGPathElement>
  dragging: boolean
}

export function useBlock({ setEditorState, path }: Params): Return {
  const touchPointWithinElemRef = useRef({ x: -1, y: -1 })
  const [dragging, setDragging] = useState(false)
  const [draggingCoords, setDraggingCoords] = useState({ x: -1, y: -1 })
  const draggingCoordsRef = useRef({ x: -1, y: -1 })

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
      // TODO: move to a func
      draggingCoordsRef.current = coords
      setDraggingCoords(coords)
      setDragging(true)
    },
    // eslint-disable-next-line
    [touchPointWithinElemRef, setEditorState, path]
  )

  const deactivate = useCallback(() => {
    if (path.length > 1) {
      setEditorState((stateOrig) => {
        const state = cloneDeep(stateOrig)
        const block = get(state, path) as Block
        block.coords = draggingCoordsRef.current
        state.push(block)
        unset(state, path)
        return state
      })
    } else {
      setEditorState((stateOrig) => {
        const state = cloneDeep(stateOrig)
        const block = get(state, path) as Block
        block.coords = draggingCoordsRef.current
        return state
      })

      setDragging(false)
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      console.log('TOUCH MOVE')
      const { clientX: touchX, clientY: touchY } = e.touches[0]

      const coords = {
        x: touchX - touchPointWithinElemRef.current.x,
        y: touchY - touchPointWithinElemRef.current.y,
      }

      draggingCoordsRef.current = coords
      setDraggingCoords(coords)
    }

    function onTouchStart(e: TouchEvent) {
      console.log('TOUCH START')
      activate(e)
    }

    function onTouchEnd() {
      console.log('TOUCH END')
      deactivate()
    }

    const svgPath = elementRef.current

    console.log('ADDING LISTENERS', svgPath)
    if (svgPath) {
      svgPath.addEventListener('touchmove', onTouchMove)
      svgPath.addEventListener('touchstart', onTouchStart)
      svgPath.addEventListener('touchend', onTouchEnd)
    }

    return () => {
      if (svgPath) {
        console.log('REMOVING LISTENERS')
        svgPath.removeEventListener('touchmove', onTouchMove)
        svgPath.removeEventListener('touchstart', onTouchStart)
        svgPath.removeEventListener('touchend', onTouchEnd)
      }
    }
    // eslint-disable-next-line
  }, [elementRef])

  return {
    ref: elementRef,
    draggingCoords,
    dragging,
  }
}
