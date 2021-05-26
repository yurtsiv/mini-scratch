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
      return () => {}
    }

    function onStart() {
      setRunning(true)
    }

    function onStop() {
      setRunning(false)
    }

    vm.on('PROJECT_RUN_START', onStart)
    vm.on('PROJECT_RUN_STOP', onStop)

    return () => {
      vm.removeListener('PROJECT_RUN_START', onStart)
      vm.removeListener('PROJECT_RUN_STOP', onStop)
    }
  }, [vm])

  return running ? (
    <PauseIcon className="control-btn" onTouchStart={onStop} />
  ) : (
    <PlayIcon onTouchStart={onStart} className="control-btn" />
  )
}
