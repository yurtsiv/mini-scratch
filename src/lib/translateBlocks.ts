import { isEmpty, merge } from 'lodash'
import { Block, BlocksState } from 'state/scriptEditor'

import { EMPTY_STAGE_TARGET } from './const'

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

  const res = { [parentId]: rootBlock }

  let nextBlock: Block | undefined = block
  while (nextBlock) {
    const vmBlock = variantToBlock[nextBlock.variant](nextBlock.config)
    vmBlock.parent = parentId
    res[nextId] = vmBlock

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
    .reduce(merge, {})
}

export function refreshVmProject(blocksState: BlocksState, vm: any) {
  const editingTarget = vm.editingTarget?.id

  if (editingTarget) {
    const blocks = getTargetBlocks(blocksState)
    if (isEmpty(blocks)) {
      return
    }

    const costume = vm.runtime.targets.find((t: any) => t.id === editingTarget)
      .sprite.costumes_[0]

    vm.loadProject({
      targets: [
        EMPTY_STAGE_TARGET,
        {
          isStage: false,
          blocks,
          name: 'Sprite1',
          costumes: [costume],
          variables: {},
          sounds: [],
        },
      ],
      meta: {
        semver: '3.0.0',
        vm: '0.2.0-prerelease.20210510162256',
      },
    })
  }
}
