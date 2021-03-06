import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

import { BLOCK_SCALE } from '../const'

type Props = {
  onApplyChange: () => void
  onChange: (v: number) => void
  value: number
  offsetX: number
}

export function ParamInput({ onApplyChange, onChange, value, offsetX }: Props) {
  const textBoxRef = useRef<any | null>(null)
  const [showInput, setShowInput] = useState(false)
  const textWidth = `${value}`.length * 9

  useEffect(() => {
    function onFocus() {
      setShowInput(true)
    }

    if (textBoxRef.current) {
      textBoxRef.current.addEventListener('focus', onFocus)
    }
  }, [textBoxRef])

  let textInput = null
  if (showInput) {
    const textBoxCoords = (textBoxRef.current as HTMLElement).getBoundingClientRect()

    textInput = ReactDOM.createPortal(
      <input
        type="number"
        autoFocus
        onBlur={() => {
          setShowInput(false)
          onApplyChange()
        }}
        onChange={(e) => onChange(+e.target.value)}
        className="param-input"
        style={{
          top: textBoxCoords.top + 5,
          left: textBoxCoords.left + 9,
          width: textWidth * BLOCK_SCALE,
          fontSize: `${12 * BLOCK_SCALE}pt`,
        }}
        value={value}
      />,
      document.body
    )
  }

  return (
    <>
      {textInput}
      <g transform={`translate(${offsetX}, 10)`}>
        <a ref={textBoxRef} href="#0">
          <path
            stroke="#3373CC"
            fill="#FFFFFF"
            fillOpacity="1"
            d={`m 0,0 m 16,0 H ${
              textWidth + 7
            } a 16 16 0 0 1 0 32 H 16 a 16 16 0 0 1 0 -32 z`}
          />
          <text x="12" y="21">
            {value}
          </text>
        </a>
      </g>
    </>
  )
}
