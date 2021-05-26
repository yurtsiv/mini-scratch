import { merge } from 'lodash'
import { Block, TargetBlocksState } from 'state/scriptEditor'

import {
  BlockVariant,
  GoToRandomConfig,
  MoveConfig,
  RotateConfig,
} from './types'

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

const motionTurnBlock = (opcode: string) => (
  config: RotateConfig,
  blockId: string,
  parent: string,
  next: string
) => {
  const numField = numFieldBlock(config.degrees) as any
  numField.parent = blockId

  return {
    [numField.id]: numField,
    [blockId]: {
      id: blockId,
      opcode,
      inputs: {
        DEGREES: {
          name: 'DEGREES',
          block: numField.id,
          shadow: numField.id,
        },
      },
      fields: {},
      parent,
      next,
    },
  }
}

const WHEN_FLAG_CLICKED = {
  opcode: 'event_whenflagclicked',
  parent: null,
  topLevel: true,
  fields: {},
}

const CONTROL_FOREVER = {
  fields: {},
  next: null,
  opcode: 'control_forever',
  shadow: false,
  topLevel: false,
}

const soundBlock = () => {
  const vm = (window as any).vm
  const soundName = vm.runtime.targets.find(
    (t: any) => t.id === vm.editingTarget.id
  )?.sprite?.sounds?.[0]?.name

  if (!soundName) {
    return {}
  }

  const blockId = genBlockId()

  const rootBlock: any = {
    ...WHEN_FLAG_CLICKED,
    id: genBlockId(),
    next: blockId,
  }

  const soundsMenu = {
    id: genBlockId(),
    opcode: 'sound_sounds_menu',
    inputs: {},
    parent: blockId,
    shadow: true,
    fields: {
      SOUND_MENU: {
        name: 'SOUND_MENU',
        value: soundName,
      },
    },
  }

  return {
    [rootBlock.id]: rootBlock,
    [soundsMenu.id]: soundsMenu,
    [blockId]: {
      id: blockId,
      opcode: 'sound_play',
      inputs: {
        SOUND_MENU: {
          name: 'SOUND_MENU',
          block: soundsMenu.id,
          shadow: soundsMenu.id,
        },
      },
      fields: {},
      parent: rootBlock.id,
    },
  }
}

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
  [BlockVariant.TurnRight]: motionTurnBlock('motion_turnright'),
  [BlockVariant.TurnLeft]: motionTurnBlock('motion_turnleft'),
  [BlockVariant.GoToRandom]: (
    config: GoToRandomConfig,
    blockId: string,
    parent: string,
    next: string
  ) => {
    const gotoMenu = {
      id: genBlockId(),
      opcode: 'motion_goto_menu',
      inputs: {},
      parent: blockId,
      shadow: true,
      fields: {
        TO: {
          name: 'TO',
          value: '_random_',
        },
      },
    }

    return {
      [gotoMenu.id]: gotoMenu,
      [blockId]: {
        id: blockId,
        opcode: 'motion_goto',
        inputs: {
          TO: {
            name: 'TO',
            block: gotoMenu.id,
            shadow: gotoMenu.id,
          },
        },
        fields: {},
        parent,
        next,
      },
    }
  },
}

function blockToVm(block: Block) {
  const rootBlock: any = {
    ...WHEN_FLAG_CLICKED,
    id: genBlockId(),
  }

  let nextId: string | undefined = genBlockId()

  const controlForever = {
    ...CONTROL_FOREVER,
    id: genBlockId(),
    inputs: {
      SUBSTACK: {
        name: 'SUBSTACK',
        block: nextId,
        shadow: null,
      },
    },
    parent: rootBlock.id,
  }

  rootBlock.next = controlForever.id

  let res = { [rootBlock.id]: rootBlock, [controlForever.id]: controlForever }

  let parentId: string | undefined = controlForever.id

  let nextBlock: Block | undefined = block
  while (nextBlock) {
    if (nextBlock.variant === BlockVariant.PlaySound) {
      res = {
        ...res,
        ...soundBlock(),
      }

      nextBlock = nextBlock?.next
      continue
    }

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

    vm.runtime.targets.forEach((target: any) => {
      if (target.id === editingTarget) {
        target.blocks._blocks = blocks

        target.blocks._scripts = Object.keys(blocks).filter(
          (key) => blocks[key].topLevel
        )

        target.blocks._cache.scripts = {}
      }
    })

    vm.stopAll()
  }
}
