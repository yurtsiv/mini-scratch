/* eslint-disable complexity */

import clsx from 'clsx'
import { Coords } from 'lib/types'
import { get } from 'lodash'
import React, { RefObject } from 'react'
import ReactDOM from 'react-dom'
import { SetterOrUpdater } from 'recoil'
import { Block as BlockT, BlocksState, DropDir } from 'state/scriptEditor'

import { PlaceholderBlock } from './PlaceholderBlock'
import { Variant } from './Variants/Variant'
import { BLOCK_HEIGHT } from './const'
import { useBlock } from './useBlock'

import './block.css'

type Props = {
  path: string
  setBlocksState: SetterOrUpdater<BlocksState>
  blocksState: BlocksState
  editorRef: RefObject<SVGElement>
  offset: Coords | null
}

export function Block({
  editorRef,
  blocksState,
  offset,
  path,
  setBlocksState,
}: Props) {
  const block = get(blocksState, path) as BlockT

  const { draggingCoords, ref, suggestDrop } = useBlock({
    editorRef,
    block,
    blocksState,
    path,
    setBlocksState,
  })

  const coords = draggingCoords
    ? { ...draggingCoords }
    : block.coords
    ? { ...block.coords }
    : {
        x: 0,
        y: BLOCK_HEIGHT,
      }

  if (offset && !draggingCoords) {
    coords.x += offset.x
    coords.y += offset.y
  }

  const suggestTop = suggestDrop === DropDir.Top
  const suggestBottom = suggestDrop === DropDir.Bottom

  const renderResult = (
    <g
      className={clsx(draggingCoords && 'group-highlighted')}
      transform={`translate(${coords.x}, ${coords.y})`}
    >
      {suggestTop && (
        <PlaceholderBlock transform={`translate(0, -${BLOCK_HEIGHT})`} />
      )}
      <Variant
        block={block}
        path={path}
        setBlocksState={setBlocksState}
        ref={ref}
      />
      {suggestBottom && (
        <PlaceholderBlock transform={`translate(0, ${BLOCK_HEIGHT})`} />
      )}
      {block.next ? (
        <Block
          editorRef={editorRef}
          blocksState={blocksState}
          path={`${path}.next`}
          setBlocksState={setBlocksState}
          offset={suggestBottom ? { x: 0, y: BLOCK_HEIGHT } : null}
        />
      ) : null}
    </g>
  )

  if (draggingCoords && path.length > 1) {
    return ReactDOM.createPortal(renderResult, editorRef.current as SVGElement)
  }

  return renderResult
}
