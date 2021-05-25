import { BlockVariant, Coords, VariantConfig } from 'lib/types'
import { atom } from 'recoil'

export enum DropDir {
  Top,
  Bottom,
}

export type BlockPath = string

export type Block = {
  id: number
  config: VariantConfig
  coords?: Coords
  variant: BlockVariant
  next?: Block
  libraryBlock?: boolean
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
      config: { steps: 1 },
      variant: BlockVariant.Move,
      coords: {
        x: 20,
        y: 30,
      },
      next: {
        id: 2,
        config: { steps: 10000 },
        variant: BlockVariant.Move,
        next: {
          id: 3,
          config: { steps: 10 },
          variant: BlockVariant.Move,
        },
      },
    },
    {
      id: 5,
      libraryBlock: true,
      variant: BlockVariant.Move,
      config: { steps: 1 },
    },
    {
      id: 6,
      libraryBlock: true,
      variant: BlockVariant.Move,
      config: { steps: 2 },
    },
    {
      id: 7,
      libraryBlock: true,
      variant: BlockVariant.Move,
      config: { steps: 3 },
    },
    {
      id: 8,
      libraryBlock: true,
      variant: BlockVariant.Move,
      config: { steps: 4 },
    },
  ],
})
