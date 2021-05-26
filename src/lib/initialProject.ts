export const INITIAL_PROJECT = {
  targets: [
    {
      isStage: true,
      name: 'Stage',
      variables: {},
      blocks: {},
      comments: {},
      currentCostume: 1,
      costumes: [
        {
          assetId: '797b03bdb8cf6ccfc30c0692d533d998',
          name: 'backdrop1',
          bitmapResolution: 2,
          md5ext: '797b03bdb8cf6ccfc30c0692d533d998.png',
          dataFormat: 'png',
          rotationCenterX: 480,
          rotationCenterY: 360,
        },
      ],
      sounds: [],
      volume: 100,
      layerOrder: 0,
      tempo: 60,
      videoTransparency: 50,
      videoState: 'off',
      textToSpeechLanguage: null,
    },
    {
      isStage: false,
      name: 'Sprite1',
      variables: {},
      blocks: {
        '0.jwptgyhzjgp': {
          fields: {},
          id: '0.jwptgyhzjgp',
          next: '0.k7nd9nwzbw',
          opcode: 'event_whenflagclicked',
          parent: null,
          topLevel: true,
        },
        '0.k7nd9nwzbw': {
          fields: {},
          inputs: { STEPS: [1, [4, 10]] },
          opcode: 'motion_movesteps',
          parent: '0.jwptgyhzjgp',
        },
      },
      costumes: [
        {
          assetId: 'bcaaa8547a07cfe572c0967ba829e99d',
          name: 'costume1',
          bitmapResolution: 1,
          md5ext: 'bcaaa8547a07cfe572c0967ba829e99d.svg',
          dataFormat: 'svg',
          rotationCenterX: 47,
          rotationCenterY: 55,
        },
      ],
      sounds: [
        {
          assetId: '83c36d806dc92327b9e7049a565c6bff',
          name: 'meow',
          dataFormat: 'wav',
          format: '',
          rate: 44100,
          sampleCount: 37376,
          md5ext: '83c36d806dc92327b9e7049a565c6bff.wav',
        },
      ],
    },
  ],
  meta: {
    semver: '3.0.0',
    vm: '0.2.0-prerelease.20210510162256',
  },
}
