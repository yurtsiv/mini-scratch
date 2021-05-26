import React from 'react'

import { ControlBtn } from './ControlBtn'
import { ResetBtn } from './ResetBtn'

import './style.css'

export function Stage() {
  return (
    <>
      <ControlBtn />
      <ResetBtn />
      <canvas id="scratch-stage" />
    </>
  )
}
