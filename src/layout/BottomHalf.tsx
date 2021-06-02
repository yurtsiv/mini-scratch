import { ImageIcon } from 'components/Icons/ImageIcon'
import { ScriptIcon } from 'components/Icons/ScriptIcon'
import { ScriptEditor } from 'components/ScriptEditor'
import { SpriteLibrary } from 'components/SpriteLibrary'
import React, { useState } from 'react'
import { useRecoilState } from 'recoil'
import { easterEggOnState } from 'state/scriptEditor'

export function BottomHalf() {
  const [view, setView] = useState<'sprites' | 'editor'>('editor')
  const [easterEggOn] = useRecoilState(easterEggOnState)

  if (easterEggOn) {
    return (
      <div className="bottom-half-container">
        <ScriptEditor />
      </div>
    )
  }

  return (
    <div className="bottom-half-container">
      {view === 'editor' ? (
        <>
          <ImageIcon
            data-testid="sprites-lib-button"
            onTouchStart={() => setView('sprites')}
            className="sprites-lib-icon"
          />
          <ScriptEditor />
        </>
      ) : (
        <>
          <ScriptIcon
            data-testid="script-editor-button"
            className="script-icon"
            onTouchStart={() => setView('editor')}
          />
          <SpriteLibrary />
        </>
      )}
    </div>
  )
}
