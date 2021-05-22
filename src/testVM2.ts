// @ts-nocheck

import AudioEngine from 'scratch-audio'
// Need to import already pre-built version since it errors out
// in this app otherwise. Probably a matter of webpack config.
import ScratchRender from 'scratch-render/dist/web/scratch-render'
import ScratchStorage from 'scratch-storage'
import ScratchSVGRenderer from 'scratch-svg-renderer'
import VirtualMachine from 'scratch-vm'

const ASSET_SERVER = 'https://cdn.assets.scratch.mit.edu/'
const PROJECT_SERVER = 'https://cdn.projects.scratch.mit.edu/'

/**
 * @param {Asset} asset - calculate a URL for this asset.
 * @returns {string} a URL to download a project file.
 */
const getProjectUrl = function (asset) {
  const assetIdParts = asset.assetId.split('.')
  const assetUrlParts = [
    PROJECT_SERVER,
    'internalapi/project/',
    assetIdParts[0],
    '/get/',
  ]
  if (assetIdParts[1]) {
    assetUrlParts.push(assetIdParts[1])
  }
  return assetUrlParts.join('')
}

/**
 * @param {Asset} asset - calculate a URL for this asset.
 * @returns {string} a URL to download a project asset (PNG, WAV, etc.)
 */
const getAssetUrl = function (asset) {
  const assetUrlParts = [
    ASSET_SERVER,
    'internalapi/asset/',
    asset.assetId,
    '.',
    asset.dataFormat,
    '/get/',
  ]
  return assetUrlParts.join('')
}

/**
 * Run the benchmark with given parameters in the location's hash field or
 * using defaults.
 */
export const runBenchmark = function () {
  // Lots of global variables to make debugging easier
  // Instantiate the VM.
  const vm = new VirtualMachine()

  vm.setTurboMode(true)

  const storage = new ScratchStorage()
  const AssetType = storage.AssetType
  storage.addWebSource([AssetType.Project], getProjectUrl)
  storage.addWebSource(
    [AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound],
    getAssetUrl
  )
  vm.attachStorage(storage)

  const projectId = '1'
  vm.downloadProjectId(projectId)

  vm.on('workspaceUpdate', () => {
    setTimeout(() => {
      vm.greenFlag()
    }, 100)
  })

  // Instantiate the renderer and connect it to the VM.
  const canvas = document.getElementById('scratch-stage')
  const halfWidth = canvas?.clientWidth / 2 / window.devicePixelRatio
  const halfHeight = canvas?.clientHeight / 2 / window.devicePixelRatio
  const renderer = new ScratchRender(
    canvas,
    -halfWidth,
    halfWidth,
    -halfHeight,
    halfHeight
  )

  // debugger
  // renderer.setStageSize(-halfWidth, halfWidth, -halfHeight, halfHeight)
  // renderer.resize(100, 100)

  // halfWidth = 100
  // halfHeight = 100
  // renderer.setStageSize(-halfWidth, halfWidth, -halfHeight, halfHeight)
  // renderer.resize(200, 200)

  vm.attachRenderer(renderer)

  const audioEngine = new AudioEngine()
  vm.attachAudioEngine(audioEngine)
  vm.attachV2BitmapAdapter(new ScratchSVGRenderer.BitmapAdapter())

  // Feed mouse events as VM I/O events.
  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    const coordinates = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    }

    vm.postIOData('mouse', coordinates)
  })
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect()
    const data = {
      isDown: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    }

    vm.postIOData('mouse', data)

    e.preventDefault()
  })
  canvas.addEventListener('mouseup', (e) => {
    const rect = canvas.getBoundingClientRect()
    const data = {
      isDown: false,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    }

    vm.postIOData('mouse', data)

    e.preventDefault()
  })

  // Feed keyboard events as VM I/O events.
  document.addEventListener('keydown', (e) => {
    // Don't capture keys intended for Blockly inputs.
    if (e.target !== document && e.target !== document.body) {
      return
    }

    vm.postIOData('keyboard', {
      keyCode: e.keyCode,
      isDown: true,
    })

    // e.preventDefault()
  })

  document.addEventListener('keyup', (e) => {
    // Always capture up events,
    // even those that have switched to other targets.
    vm.postIOData('keyboard', {
      keyCode: e.keyCode,
      isDown: false,
    })
    // E.g., prevent scroll.
    if (e.target !== document && e.target !== document.body) {
      // e.preventDefault()
    }
  })

  // Run threads
  vm.start()
}
