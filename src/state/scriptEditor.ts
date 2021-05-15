import { BLOCK_HEIGHT } from 'lib/const'
import { Coords } from 'lib/types'
import { atom } from 'recoil'

export type BlockPath = string

export enum BlockType {
  Regular,
}

export type Block = {
  id: number
  coords: Coords
  type: BlockType
  next?: Block
}

export type BlocksState = Block[]

export type DraggingState = {
  isDragging: boolean
  draggedBlockPath: BlockPath
}

export const draggingState = atom<DraggingState>({
  key: 'scriptEditorDraggingState',
  default: {
    isDragging: false,
    draggedBlockPath: '',
  },
})

export const blocksState = atom<BlocksState>({
  key: 'scriptEditorBlocksState',
  default: [
    {
      id: 1,
      type: BlockType.Regular,
      coords: {
        x: 20,
        y: 30,
      },
      next: {
        id: 2,
        type: BlockType.Regular,
        coords: {
          x: 0,
          y: BLOCK_HEIGHT,
        },
        next: {
          id: 3,
          type: BlockType.Regular,
          coords: {
            x: 0,
            y: BLOCK_HEIGHT,
          },
        },
      },
    },
  ],
})
