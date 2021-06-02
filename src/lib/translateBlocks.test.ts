import { variantToBlock } from './translateBlocks'
import { BlockVariant } from './types'

describe('#variantToBlock', () => {
  test('BlockVariant.Move', () => {
    const result = variantToBlock[BlockVariant.Move](
      { steps: 2 },
      'blockId',
      'parentId',
      'nextId'
    )

    const numFieldId = result.blockId.inputs.STEPS.block

    expect(result).toEqual({
      [numFieldId]: {
        id: numFieldId,
        fields: {
          NUM: {
            name: 'NUM',
            value: 2,
          },
        },
        inputs: {},
        opcode: 'math_number',
        topLevel: false,
        parent: 'blockId'
      },
      'blockId': {
        id: 'blockId',
        opcode: 'motion_movesteps',
        inputs: {
          STEPS: {
            name: 'STEPS',
            block: numFieldId,
            shadow: numFieldId,
          },
        },
        fields: {},
        parent: 'parentId',
        next: 'nextId',
      }
    })
  })

  test('BlockVariant.TurnRight', () => {
    const result = variantToBlock[BlockVariant.TurnRight](
      { degrees: 2 },
      'blockId',
      'parentId',
      'nextId'
    )

    const numFieldId = result.blockId.inputs.DEGREES.block

    expect(result).toEqual({
      [numFieldId]: {
        id: numFieldId,
        fields: {
          NUM: {
            name: 'NUM',
            value: 2,
          },
        },
        inputs: {},
        opcode: 'math_number',
        topLevel: false,
        parent: 'blockId'
      },
      'blockId': {
        id: 'blockId',
        opcode: 'motion_turnright',
        inputs: {
          DEGREES: {
            name: 'DEGREES',
            block: numFieldId,
            shadow: numFieldId,
          },
        },
        fields: {},
        parent: 'parentId',
        next: 'nextId',
      }
    })
  })

  test('BlockVariant.TurnLeft', () => {
    const result = variantToBlock[BlockVariant.TurnLeft](
      { degrees: 2 },
      'blockId',
      'parentId',
      'nextId'
    )

    const numFieldId = result.blockId.inputs.DEGREES.block

    expect(result).toEqual({
      [numFieldId]: {
        id: numFieldId,
        fields: {
          NUM: {
            name: 'NUM',
            value: 2,
          },
        },
        inputs: {},
        opcode: 'math_number',
        topLevel: false,
        parent: 'blockId'
      },
      'blockId': {
        id: 'blockId',
        opcode: 'motion_turnleft',
        inputs: {
          DEGREES: {
            name: 'DEGREES',
            block: numFieldId,
            shadow: numFieldId,
          },
        },
        fields: {},
        parent: 'parentId',
        next: 'nextId',
      }
    })
  })

  test('BlockVariant.GoToRandom', () => {
    const result = variantToBlock[BlockVariant.GoToRandom](
      {},
      'blockId',
      'parentId',
      'nextId'
    )

    const gotoMenuId = result.blockId.inputs.TO.block;

    expect(result).toEqual({
      [gotoMenuId]: {
        id: gotoMenuId,
        inputs: {},
        opcode: 'motion_goto_menu',
        parent: 'blockId',
        shadow: true,
        fields: {
          TO: {
            name: 'TO',
            value: '_random_',
          },
        },
      },
      'blockId': {
        id: 'blockId',
        opcode: 'motion_goto',
        inputs: {
          TO: {
            name: 'TO',
            block: gotoMenuId,
            shadow: gotoMenuId,
          },
        },
        fields: {},
        parent: 'parentId',
        next: 'nextId',
      }
    })
  })
})
