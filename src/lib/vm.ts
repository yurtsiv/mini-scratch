// @ts-nocheck

import React, { useContext } from 'react'
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

/**
 * @param {Asset} asset - calculate a URL for this asset.
 * @returns {string} a URL to download a project asset (PNG, WAV, etc.)
 */
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

export const createVm = ({ stage }: any) => {
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

  const projectId = '6'
  vm.downloadProjectId(projectId)

  // Instantiate the renderer and connect it to the VM.
  const canvas = document.getElementById('scratch-stage')
  const renderer = new ScratchRender(canvas)
  renderer.resize(
    stage.width / window.devicePixelRatio,
    stage.height / window.devicePixelRatio
  )
  const halfWidht = stage.width / 2
  const halfHeight = stage.height / 2

  renderer.setStageSize(-halfWidht, halfWidht, -halfHeight, halfHeight)

  vm.attachRenderer(renderer)

  const audioEngine = new AudioEngine()
  vm.attachAudioEngine(audioEngine)
  vm.attachV2BitmapAdapter(new ScratchSVGRenderer.BitmapAdapter())

  // Feed mouse events as VM I/O events.
  document.addEventListener('touchmove', (e) => {
    const { clientX, clientY } = e.touches[0]
    const rect = canvas.getBoundingClientRect()
    const coordinates = {
      x: clientX, //- rect.left,
      y: clientY, //- rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    }

    vm.postIOData('mouse', coordinates)
  })

  canvas.addEventListener('touchstart', (e) => {
    const { clientX, clientY } = e.touches[0]
    const rect = canvas.getBoundingClientRect()

    const data = {
      isDown: true,
      x: clientX, //- rect.left,
      y: clientY, //- rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    }

    vm.postIOData('mouse', data)
  })

  canvas.addEventListener('touchend', (e) => {
    const { clientX, clientY } = e.changedTouches[0]
    const rect = canvas.getBoundingClientRect()
    const data = {
      isDown: false,
      x: clientX, // - rect.left,
      y: clientY, // - rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    }

    vm.postIOData('mouse', data)
  })

  // Run threads
  vm.start()

  return vm
}

export const VMContext = React.createContext<any>(null)
export const useVM = () => useContext(VMContext)
