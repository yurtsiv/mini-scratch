import { concat, isEmpty } from 'lodash'
import { Block, BlocksState } from 'state/scriptEditor'

import { BlockVariant, MoveConfig } from './types'

const genBlockId = () => Math.random().toString(36)

const variantToBlock: any = {
  [BlockVariant.Move]: (config: MoveConfig) => ({
    opcode: 'motion_movesteps',
    inputs: {
      STEPS: [1, [4, config.steps]],
    },
  }),
}

const whenFlagClicked = (): any => ({
  opcode: 'event_whenflagclicked',
  parent: null,
  topLevel: true,
})

function blockToVm(block: Block) {
  let parentId = genBlockId()
  let nextId = genBlockId()

  const rootBlock = {
    id: parentId,
    ...whenFlagClicked(),
  }
  rootBlock.next = nextId

  const res = [rootBlock]

  let nextBlock: Block | undefined = block
  while (nextBlock) {
    const vmBlock = variantToBlock[nextBlock.variant](nextBlock.config)
    vmBlock.parent = parentId
    res.push(vmBlock)

    parentId = nextId
    nextId = genBlockId()

    if (nextBlock.next) {
      vmBlock.next = nextId
    }

    nextBlock = nextBlock?.next
  }

  return res
}

function getTargetBlocks(blocksState: BlocksState) {
  return Object.values(blocksState)
    .filter((block) => !block.libraryBlock)
    .map(blockToVm)
    .reduce(concat, [])
}

export function refreshVmProject(blocksState: BlocksState, vm: any) {
  const editingTarget = vm.editingTarget?.id
  if (editingTarget) {
    const blocks = getTargetBlocks(blocksState)

    if (!isEmpty(blocks)) {
      vm.shareBlocksToTarget(blocks, vm.editingTarget.id)
    }
  }
}
