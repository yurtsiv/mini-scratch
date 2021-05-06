import { findJoinPath, overlapsWithBlock } from 'lib/geometry'
import { useRefState } from 'lib/hooks/useRefState'
import { Coords } from 'lib/types'
import { cloneDeep, get, unset } from 'lodash'
import { useCallback, useRef, useState, useEffect, RefObject } from 'react'
import { SetterOrUpdater } from 'recoil'
import { Block, EditorState } from 'state/scriptEditor'

type Params = {
  editorState: EditorState
  setEditorState: SetterOrUpdater<Block[]>
  path: string
}

type Return = {
  draggingCoords: Coords
  ref: RefObject<SVGPathElement>
  dragging: boolean
}

function suggestJoin(
  editorState: EditorState,
  // setEditorState: SetterOrUpdater<Block[]>,
  draggingCoords: Coords
) {
  const targetBlockIdx = editorState.findIndex((block) =>
    overlapsWithBlock(block, draggingCoords)
  )

  if (targetBlockIdx !== -1) {
    const targetBlock = editorState[targetBlockIdx]
    console.log('FOUND TARGET', targetBlock)

    const p = findJoinPath(`${targetBlockIdx}`, targetBlock, draggingCoords)
    console.log('JOIN PATH', p)
  }
}

export function useBlock({
  editorState,
  setEditorState,
  path,
}: Params): Return {
  const [
    draggingCoordsRef,
    draggingCoords,
    setDraggingCoords,
  ] = useRefState<Coords>({ x: -1, y: -1 })
  const touchPointWithinElemRef = useRef({ x: -1, y: -1 })
  const [dragging, setDragging] = useState(false)

  const elementRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    suggestJoin(editorState, draggingCoords)
  }, [draggingCoords, editorState])

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
  }, [activate, deactivate, path, setDraggingCoords, elementRef])

  return {
    ref: elementRef,
    draggingCoords,
    dragging,
  }
}
