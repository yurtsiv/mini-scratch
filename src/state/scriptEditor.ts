import { Coords } from 'lib/types'
import { atom } from 'recoil'

export enum BlockType {
  Ghost,
  Regular,
}

export type Block = {
  id: number
  coords: Coords
  type: BlockType
  next?: Block
}

export type EditorState = Block[]

export const scriptEditorState = atom<EditorState>({
  key: 'scriptEditorState',
  default: [
    {
      id: 1,
      type: BlockType.Regular,
      coords: {
        x: 50,
        y: 20,
      },
      next: {
        id: 2,
        type: BlockType.Regular,
        coords: {
          x: 0,
          y: 50,
        },
        next: {
          id: 3,
          type: BlockType.Regular,
          coords: {
            x: 0,
            y: 50,
          },
        },
      },
    },
  ],
})
