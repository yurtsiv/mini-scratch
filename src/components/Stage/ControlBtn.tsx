import { PauseIcon } from 'components/Icons/PauseIcon'
import { PlayIcon } from 'components/Icons/PlayIcon'
import { useVM } from 'lib/vm'
import React, { useEffect, useState } from 'react'

export function ControlBtn() {
  const vm = useVM()
  const [running, setRunning] = useState(false)

  const onStart = () => vm.greenFlag()
  const onStop = () => vm.stopAll()

  useEffect(() => {
    if (!vm) {
      return
    }

    vm.on('PROJECT_RUN_START', () => {
      setRunning(true)
    })
    vm.on('PROJECT_RUN_STOP', () => {
      setRunning(false)
    })
  }, [vm])

  return running ? (
    <PauseIcon className="control-icon" onTouchStart={onStop} />
  ) : (
    <PlayIcon onTouchStart={onStart} className="control-icon" />
  )
}
