import { BLOCK_HEIGHT } from 'lib/const'
import { findJoinPath, overlapsWithBlock } from 'lib/geometry'
import { useRefState } from 'lib/hooks/useRefState'
import { Coords } from 'lib/types'
import { cloneDeep, get, set, unset } from 'lodash'
import {
  useCallback,
  useRef,
  useEffect,
  RefObject,
  MutableRefObject,
} from 'react'
import { SetterOrUpdater, useRecoilState } from 'recoil'
import {
  Block,
  BlockType,
  BlocksState,
  draggingState,
} from 'state/scriptEditor'

type Params = {
  blocksState: BlocksState
  setBlocksState: SetterOrUpdater<Block[]>
  path: string
}

type Return = {
  draggingCoords: Coords | null
  ref: RefObject<SVGPathElement>
}

function suggestJoinPath(
  blocksState: BlocksState,
  draggingCoords: Coords,
  ignoreBlock: string,
  skipLast: boolean
): string | null {
  const targetBlockIdx = blocksState.findIndex((block) =>
    overlapsWithBlock(block, draggingCoords, skipLast)
  )

  if (targetBlockIdx !== -1) {
    const targetBlock = blocksState[targetBlockIdx]
    return findJoinPath(
      `${targetBlockIdx}`,
      targetBlock,
      draggingCoords,
      skipLast
    )
  }

  return null
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
  // const suggestedJoinPathRef: MutableRefObject<string | null> = useRef<string>(
  //   null
  // )
  const [isDragging, setIsDragging] = useRecoilState(draggingState)

  const elementRef = useRef<SVGPathElement>(null)
  useEffect(() => {
    function onTouchMove(e: TouchEvent) {
      const rect = elementRef.current?.getBoundingClientRect()
      console.log(
        'touch moveing window',
        { moveX: e.touches[0].clientX, moveY: e.touches[0].clientY },
        { elemX: rect?.top, elemY: rect?.left }
      )
    }

    window.addEventListener('touchmove', onTouchMove)
  }, [isDragging])

  // useEffect(() => {
  //   if (!draggingCoords) {
  //     return
  //   }

  //   const nestedBlock = path.split('.').length > 1
  //   const newJoinPath = suggestJoinPath(
  //     blocksState,
  //     draggingCoords,
  //     path,
  //     nestedBlock
  //   )
  //   if (suggestedJoinPathRef.current !== newJoinPath) {
  //     console.log('NEW PATH', newJoinPath)
  //     // console.log('PREV PATH', suggestedJoinPathRef.current)
  //     setBlocksState((stateOrig) => {
  //       const state = cloneDeep(stateOrig)

  //       // remove previous ghost block
  //       if (suggestedJoinPathRef.current) {
  //         const preGhostBlock = get(state, suggestedJoinPathRef.current)
  //         set(state, suggestedJoinPathRef.current, preGhostBlock.next)
  //       }

  //       if (!newJoinPath) {
  //         return state
  //       }

  //       const followingBlock = get(state, newJoinPath)

  //       if (newJoinPath.split('.').length > 1) {
  //         const ghostBlock: Block = {
  //           id: Date.now(),
  //           type: BlockType.Ghost,
  //           coords: {
  //             x: 0,
  //             y: BLOCK_HEIGHT,
  //           },
  //           next: followingBlock,
  //         }

  //         set(state, newJoinPath, ghostBlock)
  //       } else {
  //         const ghostBlock: Block = {
  //           id: Date.now(),
  //           type: BlockType.Ghost,
  //           coords: followingBlock.coords,
  //           next: {
  //             ...followingBlock,
  //             coords: {
  //               x: 0,
  //               y: BLOCK_HEIGHT,
  //             },
  //           },
  //         }

  //         console.log(ghostBlock)

  //         set(state, newJoinPath, ghostBlock)
  //       }

  //       return state
  //     })
  //   }

  //   suggestedJoinPathRef.current = newJoinPath
  // }, [draggingCoords, blocksState, path, setBlocksState])

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
    },
    [touchPointWithinElemRef, setDraggingCoords]
  )

  const deactivate = useCallback(() => {
    const nestedBlock = path.split('.').length > 1
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
  }, [setDraggingCoords, path, setBlocksState, draggingCoordsRef])

  useEffect(() => {
    console.log('COMPONENT CREATED', path)
    return () => {
      console.log('COMPONENT DESTROYED', path)
    }
  }, [])

  useEffect(() => {
    console.log('REGISTERING CALLBACKS', path)
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
      console.log('TOUCH CANCEL', path)
      deactivate()
    }

    const svgPath = elementRef.current

    if (svgPath) {
      svgPath.addEventListener('touchmove', onTouchMove)
      svgPath.addEventListener('touchstart', onTouchStart)
      svgPath.addEventListener('touchend', onTouchEnd)
      svgPath.addEventListener('touchcancel', onTouchCancel)
    }

    return () => {
      console.log('UNREGISTERING CALLBACKS', path)
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
  }
}
