// @ts-nocheck

import React, { useContext } from 'react'
import AudioEngine from 'scratch-audio'
// Need to import already pre-built version since it errors out
// in this app otherwise. Probably a matter of webpack config.
import ScratchRender from 'scratch-render/dist/web/scratch-render'
import ScratchStorage from 'scratch-storage'
import ScratchSVGRenderer from 'scratch-svg-renderer'

import VirtualMachine from '../scratch-vm/src/virtual-machine'
import { INITIAL_PROJECT } from './initialProject'

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

const getScratchCoords = (renderer, rect, x, y) => {
  const nativeSize = renderer.getNativeSize()
  return [
    (nativeSize[0] / rect.width) * (x - rect.width / 2),
    (nativeSize[1] / rect.height) * (y - rect.height / 2),
  ]
}

const handleEventListeners = (vm, canvas) => {
  const renderer = vm.renderer
  const rect = canvas.getBoundingClientRect()

  let dragOffset = []
  let moved = false
  let dragging = false
  let dragId = null

  function onStartDrag(e) {
    if (dragging) {
      return
    }

    const { clientX: x, clientY: y } = e.touches[0]

    const drawableId = renderer.pick(x, y)
    if (drawableId === null) {
      return
    }

    const targetId = vm.getTargetIdForDrawableId(drawableId)
    if (targetId === null) {
      return
    }

    const target = vm.runtime.getTargetById(targetId)

    // Dragging always brings the target to the front
    target.goToFront()

    const [scratchMouseX, scratchMouseY] = getScratchCoords(
      renderer,
      rect,
      x,
      y
    )

    const offsetX = target.x - scratchMouseX
    const offsetY = -(target.y + scratchMouseY)

    vm.startDrag(targetId)

    dragId = targetId
    dragOffset = [offsetX, offsetY]
    dragging = true
  }

  canvas.addEventListener(
    'touchmove',
    (e) => {
      const { clientX, clientY } = e.touches[0]

      onStartDrag(e)

      if (!dragging) {
        return
      }

      const spritePosition = getScratchCoords(renderer, rect, clientX, clientY)
      vm.postSpriteInfo({
        x: spritePosition[0] + dragOffset[0],
        y: -(spritePosition[1] + dragOffset[1]),
        force: true,
      })

      const coordinates = {
        x: clientX,
        y: clientY,
        canvasWidth: rect.width,
        canvasHeight: rect.height,
      }

      vm.postIOData('mouse', coordinates)
      moved = true
    },
    { passive: true }
  )

  canvas.addEventListener(
    'touchend',
    (e) => {
      const { clientX, clientY } = e.changedTouches[0]
      const rect = canvas.getBoundingClientRect()
      const data = {
        x: clientX,
        y: clientY,
        canvasWidth: rect.width,
        canvasHeight: rect.height,
      }

      if (!moved) {
        vm.postIOData('mouse', { ...data, isDown: true })
      }

      vm.postIOData('mouse', { ...data, isDown: false })
      vm.stopDrag(dragId)
      dragId = null
      moved = false
      dragging = false
    },
    { passive: true }
  )
}

export const createVm = ({ stage }: any) => {
  const vm = new VirtualMachine()

  const storage = new ScratchStorage()
  const AssetType = storage.AssetType
  storage.addWebSource([AssetType.Project], getProjectUrl)
  storage.addWebSource(
    [AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound],
    getAssetUrl
  )
  vm.attachStorage(storage)

  // const projectId = '48042'
  // vm.downloadProjectId(projectId)
  vm.loadProject(INITIAL_PROJECT)

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

  handleEventListeners(vm, canvas)

  // Run threads
  vm.start()

  return vm
}

export const VMContext = React.createContext<any>(null)
export const useVM = () => useContext(VMContext)
