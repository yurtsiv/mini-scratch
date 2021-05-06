import { Coords } from 'lib/types'
import { atom } from 'recoil'

export type Block = {
  id: number
  coords: Coords
  next?: Block
}

export type EditorState = Block[]

export const scriptEditorState = atom<EditorState>({
  key: 'scriptEditorState',
  default: [
    {
      id: 1,
      coords: {
        x: 50,
        y: 20,
      },
      next: {
        id: 2,
        coords: {
          x: 0,
          y: 50,
        },
        next: {
          id: 3,
          coords: {
            x: 0,
            y: 50,
          },
        },
      },
    },
  ],
})
