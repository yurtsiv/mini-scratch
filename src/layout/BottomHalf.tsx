import { ImageIcon } from 'components/Icons/ImageIcon'
import { ScriptIcon } from 'components/Icons/ScriptIcon'
import { ScriptEditor } from 'components/ScriptEditor'
import { SpriteLibrary } from 'components/SpriteLibrary'
import React, { useState } from 'react'

export function BottomHalf() {
  const [view, setView] = useState<'sprites' | 'editor'>('editor')

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
          <SpriteLibrary />
        </>
      )}
    </div>
  )
}
