import React from 'react'

import { ControlBtn } from './ControlBtn'

import './style.css'

export function Stage() {
  return (
    <>
      <ControlBtn />
      <canvas id="scratch-stage" />
    </>
  )
}
