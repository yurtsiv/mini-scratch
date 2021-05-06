import { get } from 'lodash'
import React, { ForwardedRef, RefObject, SVGProps } from 'react'
import ReactDOM from 'react-dom'
import { SetterOrUpdater } from 'recoil'
import { Block as BlockT, EditorState } from 'state/scriptEditor'

import { useBlock } from './useBlock'

type Props = {
  path: string[]
  setEditorState: SetterOrUpdater<EditorState>
  editorState: EditorState
  editorRef: RefObject<SVGElement>
}

function BlockPathC(
  props: SVGProps<SVGPathElement>,
  ref: ForwardedRef<SVGPathElement>
) {
  return (
    <path
      fill="#4C97FF"
      fillOpacity="1"
      d="m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H 145.3670997619629 a 4,4 0 0,1 4,4 v 40  a 4,4 0 0,1 -4,4 H 48   c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z"
      ref={ref}
      {...props}
    />
  )
}

const BlockPath = React.forwardRef(BlockPathC)

export function Block({ editorRef, editorState, path, setEditorState }: Props) {
  const block = get(editorState, path) as BlockT

  const { dragging, draggingCoords, ref } = useBlock({
    path,
    setEditorState,
  })

  console.log('DRAGGING', dragging)

  if (!editorRef.current) {
    return null
  }

  const coords = dragging ? draggingCoords : block.coords

  const renderResult = block.next ? (
    <g
      stroke={dragging ? 'red' : ''}
      transform={`translate(${coords.x}, ${coords.y})`}
    >
      <BlockPath ref={ref} />
      <Block
        editorRef={editorRef}
        editorState={editorState}
        path={[...path, 'next']}
        setEditorState={setEditorState}
      />
    </g>
  ) : (
    <BlockPath
      ref={ref}
      stroke={dragging ? 'red' : ''}
      transform={`translate(${coords.x}, ${coords.y})`}
    />
  )

  if (dragging && path.length > 1) {
    return ReactDOM.createPortal(renderResult, editorRef.current as SVGElement)
  }

  return renderResult
}
