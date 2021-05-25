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
      variant: BlockVariant.TurnRight,
      config: { degrees: 1 },
    },
    '7': {
      id: '7',
      index: 3,
      libraryBlock: true,
      variant: BlockVariant.TurnLeft,
      config: { degrees: 1 },
    },
    '8': {
      id: '8',
      index: 4,
      libraryBlock: true,
      variant: BlockVariant.GoToRandom,
      config: {},
    },
    '9': {
      id: '9',
      index: 4,
      libraryBlock: true,
      variant: BlockVariant.Move,
      config: { steps: 4 },
    },
    '10': {
      id: '10',
      index: 4,
      libraryBlock: true,
      variant: BlockVariant.Move,
      config: { steps: 4 },
    },
  },
})
