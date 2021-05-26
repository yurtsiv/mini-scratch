import { isEmpty, merge } from 'lodash'
import { Block, TargetBlocksState } from 'state/scriptEditor'

import { BlockVariant, MoveConfig } from './types'

const genBlockId = () => Math.random().toString(36)

const numFieldBlock = (value: number) => ({
  id: genBlockId(),
  fields: {
    NUM: {
      name: 'NUM',
      value,
    },
  },
  inputs: {},
  opcode: 'math_number',
  topLevel: false,
})

const variantToBlock: any = {
  [BlockVariant.Move]: (
    config: MoveConfig,
    blockId: string,
    parent: string,
    next: string
  ) => {
    const numField = numFieldBlock(config.steps) as any
    numField.parent = blockId

    return {
      [numField.id]: numField,
      [blockId]: {
        id: blockId,
        opcode: 'motion_movesteps',
        inputs: {
          STEPS: {
            name: 'STEPS',
            block: numField.id,
            shadow: numField.id,
          },
        },
        fields: {},
        parent,
        next,
      },
    }
  },
}

const whenFlagClicked = (): any => ({
  opcode: 'event_whenflagclicked',
  parent: null,
  topLevel: true,
  fields: {},
})

function blockToVm(block: Block) {
  const rootId = genBlockId()
  let parentId: string | undefined = genBlockId()
  let nextId: string | undefined = rootId

  const rootBlock = {
    id: parentId,
    ...whenFlagClicked(),
  }
  rootBlock.next = nextId

  let res = { [parentId]: rootBlock }

  let nextBlock: Block | undefined = block
  while (nextBlock) {
    const blockId = nextId
    nextId = nextBlock.next ? genBlockId() : undefined

    const blocks = variantToBlock[nextBlock.variant](
      nextBlock.config,
      blockId,
      parentId,
      nextId
    )

    parentId = blockId

    res = {
      ...res,
      ...blocks,
    }

    nextBlock = nextBlock?.next
  }

  return res
}

function getTargetBlocks(blocksState: TargetBlocksState) {
  return Object.values(blocksState)
    .filter((block) => !block.libraryBlock)
    .map(blockToVm)
    .reduce(merge, {})
}

export function refreshVmProject(blocksState: TargetBlocksState, vm: any) {
  const editingTarget = vm.editingTarget?.id

  if (editingTarget) {
    const blocks = getTargetBlocks(blocksState)
    if (isEmpty(blocks)) {
      return
    }

    vm.runtime.targets.forEach((target: any) => {
      if (target.id === editingTarget) {
        target.blocks._blocks = blocks

        target.blocks._scripts = Object.keys(blocks).filter(
          (key) => blocks[key].topLevel
        )

        target.blocks._cache.scripts = {}
      }
    })

    vm.emitWorkspaceUpdate()
  }
}
