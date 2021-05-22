import { ImageIcon } from 'components/Icons/ImageIcon'
import { ScriptIcon } from 'components/Icons/ScriptIcon'
import { ScriptEditor } from 'components/ScriptEditor'
import { SpriteLibrary } from 'components/SpriteLibrary'
import React, { useState } from 'react'

type Props = {
  vm: any
}

export function BottomHalf({ vm }: Props) {
  const [view, setView] = useState<'sprites' | 'editor'>('sprites')

  return (
    <div className="bottom-half-container">
      {view === 'editor' ? (
        <>
          <ImageIcon
            onTouchStart={() => setView('sprites')}
            className="sprites-lib-icon"
          />
          <ScriptEditor />
        </>
      ) : (
        <>
          <ScriptIcon
            className="script-icon"
            onTouchStart={() => setView('editor')}
          />
          <SpriteLibrary vm={vm} />
        </>
      )}
    </div>
  )
}
