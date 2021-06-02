import React from 'react'

import { ControlBtn } from './ControlBtn'
import { ResetBtn } from './ResetBtn'

import './style.css'

function StageC(props: any, ref: any) {
  return (
    <>
      <ControlBtn />
      <ResetBtn />
      <canvas id="scratch-stage" ref={ref} />
    </>
  )
}

export const Stage = React.forwardRef(StageC);