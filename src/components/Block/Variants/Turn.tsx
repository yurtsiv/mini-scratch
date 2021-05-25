import { BlockVariant, RotateConfig } from 'lib/types'
import React, {
  ForwardedRef,
  FunctionComponent,
  useEffect,
  useState,
} from 'react'

import { BasicBlockBackground } from './BasicBlockBackground'
import { ParamInput } from './ParamInput'
import { VariantProps } from './const'

interface Props extends VariantProps {
  config: RotateConfig
  IconComp: FunctionComponent<any>
}

function TurnC(
  { setConfig, config, IconComp, ...props }: Props,
  ref: ForwardedRef<SVGGElement>
) {
  const [degrees, setDegrees] = useState(config.degrees)
  useEffect(() => {
    setDegrees(config.degrees)
  }, [config.degrees])

  const textWidth = `${degrees}`.length * 10

  return (
    <g ref={ref} {...props}>
      <BasicBlockBackground
        className="motion-block-path"
        text={`${degrees}`}
        blockVariant={BlockVariant.TurnLeft}
        additionalWidth={43}
      />
      <text className="block-text" x="8" y="30">
        turn
      </text>
      <IconComp width="25" height="25" y="13" x="50" />
      <ParamInput
        onApplyChange={() => setConfig({ degrees })}
        onChange={setDegrees}
        value={degrees}
        offsetX={80}
      />
      <text className="block-text" x={`${textWidth + 110}`} y="30">
        degrees
      </text>
    </g>
  )
}

export const Turn = React.forwardRef<SVGGElement, Props>(TurnC)
