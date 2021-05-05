import { Coords } from 'lib/types'
import { atom } from 'recoil'

export type Block = {
  id: number
  active: boolean
  coords: Coords
  next?: Block
}

export type EditorState = Block[]

export const scriptEditorState = atom<EditorState>({
  key: 'scriptEditorState',
  default: [
    {
      id: 1,
      active: false,
      coords: {
        x: 50,
        y: 20,
      },
      next: {
        id: 2,
        active: false,
        coords: {
          x: 0,
          y: 50,
        },
        next: {
          id: 3,
          active: false,
          coords: {
            x: 0,
            y: 50,
          },
        },
      },
    },
  ],
})
