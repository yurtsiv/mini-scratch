// @ts-nocheck
const ScratchStorage = require('scratch-storage')
const ScratchRender = require('scratch-render')
const AudioEngine = require('scratch-audio')
const ScratchSVGRenderer = require('scratch-svg-renderer')

const Runtime = require('./scratch-vm/src/engine/runtime')
const VirtualMachine = require('./scratch-vm/src/virtual-machine')

const ASSET_SERVER = 'https://cdn.assets.scratch.mit.edu/'
const PROJECT_SERVER = 'https://cdn.projects.scratch.mit.edu/'

const getAssetUrl = (asset) => {
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

const getProjectUrl = (asset) => {
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

export function runVMTest() {
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

  // Instantiate the renderer and connect it to the VM.
  const canvas = document.getElementById('scratch-stage')
  debugger
  const renderer = new ScratchRender(canvas)
  vm.attachRenderer(renderer)
  const audioEngine = new AudioEngine()
  vm.attachAudioEngine(audioEngine)
  vm.attachV2BitmapAdapter(new ScratchSVGRenderer.BitmapAdapter())

  vm.start()

  // vm.downloadProjectId('2')
}
