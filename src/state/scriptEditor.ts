import { BlockVariant, Coords, VariantConfig } from 'lib/types'
import { atom } from 'recoil'

export enum DropDir {
  Top,
  Bottom,
}

export type BlockPath = string

export type Block = {
  id: string
  config: VariantConfig
  coords?: Coords
  variant: BlockVariant
  next?: Block
  libraryBlock?: boolean
  index?: number
}

export type BlocksState = Record<string, Block>

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
  default: {
    '1': {
      id: '1',
      config: { steps: 1 },
      variant: BlockVariant.Move,
      coords: {
        x: 20,
        y: 30,
      },
      next: {
        id: '2',
        config: { steps: 10000 },
        variant: BlockVariant.Move,
        next: {
          id: '3',
          config: { steps: 10 },
          variant: BlockVariant.Move,
        },
      },
    },
    '5': {
      id: '5',
      index: 1,
      libraryBlock: true,
      variant: BlockVariant.Move,
      config: { steps: 1 },
    },
    '6': {
      id: '6',
      index: 2,
      libraryBlock: true,
      variant: BlockVariant.Move,
      config: { steps: 2 },
    },
    '7': {
      id: '7',
      index: 3,
      libraryBlock: true,
      variant: BlockVariant.Move,
      config: { steps: 3 },
    },
    '8': {
      id: '8',
      index: 4,
      libraryBlock: true,
      variant: BlockVariant.Move,
      config: { steps: 4 },
    },
  },
})
