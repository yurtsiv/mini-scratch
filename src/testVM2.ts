// @ts-nocheck

class LoadingMiddleware {
  constructor() {
    this.middleware = []
    this.host = null
    this.original = null
  }

  install(host, original) {
    this.host = host
    this.original = original
    const { middleware } = this
    return function (...args) {
      let i = 0
      const next = function (_args) {
        if (i >= middleware.length) {
          return original.call(host, ..._args)
        }
        return middleware[i++](_args, next)
      }
      return next(args)
    }
  }

  push(middleware) {
    this.middleware.push(middleware)
  }
}

const importLoadCostume = require('./scratch-vm/src/import/load-costume')
const costumeMiddleware = new LoadingMiddleware()
importLoadCostume.loadCostume = costumeMiddleware.install(
  importLoadCostume,
  importLoadCostume.loadCostume
)

const importLoadSound = require('./scratch-vm/src/import/load-sound')
const soundMiddleware = new LoadingMiddleware()
importLoadSound.loadSound = soundMiddleware.install(
  importLoadSound,
  importLoadSound.loadSound
)

const ScratchStorage = require('scratch-storage/dist/web/scratch-storage.js')
const VirtualMachine = require('./scratch-vm/src/virtual-machine')
const Runtime = require('./scratch-vm/src/engine/runtime')

const ScratchRender = require('scratch-render/dist/web/scratch-render.js')
const AudioEngine = require('scratch-audio')
const ScratchSVGRenderer = require('scratch-svg-renderer/dist/web/scratch-svg-renderer.js')

const Scratch = (window.Scratch = window.Scratch || {})

const ASSET_SERVER = 'https://cdn.assets.scratch.mit.edu/'
const PROJECT_SERVER = 'https://cdn.projects.scratch.mit.edu/'

const SLOW = 0.1

const setShareLink = function (json) {
  document.querySelector('.share').href = `#view/${btoa(JSON.stringify(json))}`
  document.querySelectorAll('.share')[1].href = `suite.html`
}

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

class LoadingProgress {
  constructor(callback) {
    this.dataLoaded = 0
    this.contentTotal = 0
    this.contentComplete = 0
    this.hydrateTotal = 0
    this.hydrateComplete = 0
    this.memoryCurrent = 0
    this.memoryPeak = 0
    this.callback = callback
  }

  sampleMemory() {
    if (window.performance && window.performance.memory) {
      this.memoryCurrent = window.performance.memory.usedJSHeapSize
      this.memoryPeak = Math.max(this.memoryCurrent, this.memoryPeak)
    }
  }

  attachHydrateMiddleware(middleware) {
    const _this = this
    middleware.push((args, next) => {
      _this.hydrateTotal += 1
      _this.sampleMemory()
      _this.callback(_this)
      return Promise.resolve(next(args)).then((value) => {
        _this.hydrateComplete += 1
        _this.sampleMemory()
        _this.callback(_this)
        return value
      })
    })
  }

  on(storage, vm) {
    const _this = this

    this.attachHydrateMiddleware(costumeMiddleware)
    this.attachHydrateMiddleware(soundMiddleware)

    const _load = storage.webHelper.load
    storage.webHelper.load = function (...args) {
      if (_this.dataLoaded === 0 && window.performance) {
        // Mark in browser inspectors how long it takes to load the
        // projects initial data file.
        performance.mark('Scratch.LoadDataStart')
      }

      const result = _load.call(this, ...args)

      if (_this.dataLoaded) {
        if (_this.contentTotal === 0 && window.performance) {
          performance.mark('Scratch.DownloadStart')
        }

        _this.contentTotal += 1
      }
      _this.sampleMemory()
      _this.callback(_this)

      result.then(() => {
        if (_this.dataLoaded === 0) {
          if (window.performance) {
            // How long did loading the data file take?
            // performance.mark('Scratch.LoadDataEnd')
            // performance.measure(
            //   'Scratch.LoadData',
            //   'Scratch.LoadDataStart',
            //   'Scratch.LoadDataEnd'
            // )
          }

          _this.dataLoaded = 1

          window.ScratchVMLoadDataEnd = Date.now()
        } else {
          _this.contentComplete += 1
        }

        if (
          _this.contentComplete &&
          _this.contentComplete === _this.contentTotal
        ) {
          if (window.performance) {
            // How long did it take to download the html, js, and
            // all the project assets?
            // performance.mark('Scratch.DownloadEnd')
            // performance.measure(
            //   'Scratch.Download',
            //   'Scratch.DownloadStart',
            //   'Scratch.DownloadEnd'
            // )
          }

          window.ScratchVMDownloadEnd = Date.now()
        }

        _this.sampleMemory()
        _this.callback(_this)
      })
      return result
    }
    vm.runtime.on(Runtime.PROJECT_LOADED, () => {
      // Currently LoadingProgress tracks when the data has been loaded
      // and not when the data has been decoded. It may be difficult to
      // track that but it isn't hard to track when its all been decoded.
      if (window.performance) {
        // How long did it take to load and hydrate the html, js, and
        // all the project assets?
        performance.mark('Scratch.LoadEnd')
        // performance.measure(
        //   'Scratch.Load',
        //   'Scratch.LoadStart',
        //   'Scratch.LoadEnd'
        // )
      }

      window.ScratchVMLoadEnd = Date.now()

      // With this event lets update LoadingProgress a final time so its
      // displayed loading time is accurate.
      _this.sampleMemory()
      _this.callback(_this)
    })
  }
}

class StatTable {
  constructor({ table, keys, viewOf, isSlow }) {
    this.table = table
    if (keys) {
      this.keys = keys
    }
    if (viewOf) {
      this.viewOf = viewOf
    }
    if (isSlow) {
      this.isSlow = isSlow
    }
  }

  render() {
    const table = this.table
    Array.from(table.children).forEach((node) => table.removeChild(node))
    const keys = this.keys()
    for (const key of keys) {
      this.viewOf(key).render({
        table,
        isSlow: (frame) => this.isSlow(key, frame),
      })
    }
  }
}

class StatView {
  constructor(name) {
    this.name = name
    this.executions = 0
    this.selfTime = 0
    this.totalTime = 0
  }

  update(selfTime, totalTime, count) {
    this.executions += count
    this.selfTime += selfTime
    this.totalTime += totalTime
  }

  render({ table, isSlow }) {
    const row = document.createElement('tr')
    let cell = document.createElement('td')
    cell.innerText = this.name
    row.appendChild(cell)

    if (isSlow(this)) {
      row.setAttribute('class', 'slow')
    }

    cell = document.createElement('td')
    cell.style.textAlign = 'right'
    cell.innerText = '---'
    // Truncate selfTime. Value past the microsecond are floating point
    // noise.
    this.selfTime = Math.floor(this.selfTime * 1000) / 1000
    if (this.selfTime > 0) {
      cell.innerText = (this.selfTime / 1000).toFixed(3)
    }
    row.appendChild(cell)

    cell = document.createElement('td')
    cell.style.textAlign = 'right'
    cell.innerText = '---'
    // Truncate totalTime. Value past the microsecond are floating point
    // noise.
    this.totalTime = Math.floor(this.totalTime * 1000) / 1000
    if (this.totalTime > 0) {
      cell.innerText = (this.totalTime / 1000).toFixed(3)
    }
    row.appendChild(cell)

    cell = document.createElement('td')
    cell.style.textAlign = 'right'
    cell.innerText = this.executions
    row.appendChild(cell)

    table.appendChild(row)
  }
}

class RunningStats {
  constructor(profiler) {
    this.stepThreadsInnerId = profiler.idByName('Sequencer.stepThreads#inner')
    this.blockFunctionId = profiler.idByName('blockFunction')
    this.stpeThreadsId = profiler.idByName('Sequencer.stepThreads')

    this.recordedTime = 0
    this.executed = {
      steps: 0,
      blocks: 0,
    }
  }

  update(id, arg, selfTime, totalTime, count) {
    if (id === this.stpeThreadsId) {
      this.recordedTime += totalTime
    } else if (id === this.stepThreadsInnerId) {
      this.executed.steps += count
    } else if (id === this.blockFunctionId) {
      this.executed.blocks += count
    }
  }
}

const WORK_TIME = 0.75

class Frames {
  constructor(profiler) {
    this.profiler = profiler

    this.frames = []
  }

  update(id, arg, selfTime, totalTime, count) {
    if (id < 0) return
    if (!this.frames[id]) {
      this.frames[id] = new StatView(this.profiler.nameById(id))
    }
    this.frames[id].update(selfTime, totalTime, count)
  }
}

const frameOrder = [
  'blockFunction',
  'execute',
  'Sequencer.stepThread',
  'Sequencer.stepThreads#inner',
  'Sequencer.stepThreads',
  'RenderWebGL.draw',
  'Runtime._step',
]

class ProfilerRun {
  constructor({ vm, maxRecordedTime, warmUpTime }) {
    this.vm = vm
  }

  run() {
    this.projectId = '5'
    this.vm.downloadProjectId(this.projectId)

    window.parent.postMessage(
      {
        type: 'BENCH_MESSAGE_LOADING',
      },
      '*'
    )

    this.vm.on('workspaceUpdate', () => {
      setTimeout(() => {
        this.vm.greenFlag()
        debugger
      }, 100)
    })
  }

  render(json) {}
}

/**
 * Run the benchmark with given parameters in the location's hash field or
 * using defaults.
 */
export const runBenchmark = function () {
  // Lots of global variables to make debugging easier
  // Instantiate the VM.
  const vm = new VirtualMachine()
  Scratch.vm = vm

  vm.setTurboMode(true)

  const storage = new ScratchStorage()
  const AssetType = storage.AssetType
  storage.addWebSource([AssetType.Project], getProjectUrl)
  storage.addWebSource(
    [AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound],
    getAssetUrl
  )
  vm.attachStorage(storage)

  new LoadingProgress((progress) => {
    const setElement = (name, value) => {
      // document.getElementsByClassName(name)[0].innerText = value
    }
    const sinceLoadStart = (key) =>
      `(${(window[key] || Date.now()) - window.ScratchVMLoadStart}ms)`

    setElement('loading-total', 1)
    setElement('loading-complete', progress.dataLoaded)
    setElement('loading-time', sinceLoadStart('ScratchVMLoadDataEnd'))

    setElement('loading-content-total', progress.contentTotal)
    setElement('loading-content-complete', progress.contentComplete)
    setElement('loading-content-time', sinceLoadStart('ScratchVMDownloadEnd'))

    setElement('loading-hydrate-total', progress.hydrateTotal)
    setElement('loading-hydrate-complete', progress.hydrateComplete)
    setElement('loading-hydrate-time', sinceLoadStart('ScratchVMLoadEnd'))

    if (progress.memoryPeak) {
      setElement(
        'loading-memory-current',
        `${(progress.memoryCurrent / 1000000).toFixed(0)}MB`
      )
      setElement(
        'loading-memory-peak',
        `${(progress.memoryPeak / 1000000).toFixed(0)}MB`
      )
    }
  }).on(storage, vm)

  let warmUpTime = 4000
  let maxRecordedTime = 6000

  if (location.hash) {
    const split = location.hash.substring(1).split(',')
    if (split[1] && split[1].length > 0) {
      warmUpTime = Number(split[1])
    }
    maxRecordedTime = Number(split[2] || '0') || 6000
  }

  new ProfilerRun({
    vm,
    warmUpTime,
    maxRecordedTime,
  }).run()

  // Instantiate the renderer and connect it to the VM.
  const canvas = document.getElementById('scratch-stage')
  const renderer = new ScratchRender(canvas)
  Scratch.renderer = renderer
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
    Scratch.vm.postIOData('mouse', coordinates)
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
    Scratch.vm.postIOData('mouse', data)
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
    Scratch.vm.postIOData('mouse', data)
    e.preventDefault()
  })

  // Feed keyboard events as VM I/O events.
  document.addEventListener('keydown', (e) => {
    // Don't capture keys intended for Blockly inputs.
    if (e.target !== document && e.target !== document.body) {
      return
    }
    Scratch.vm.postIOData('keyboard', {
      keyCode: e.keyCode,
      isDown: true,
    })
    e.preventDefault()
  })
  document.addEventListener('keyup', (e) => {
    // Always capture up events,
    // even those that have switched to other targets.
    Scratch.vm.postIOData('keyboard', {
      keyCode: e.keyCode,
      isDown: false,
    })
    // E.g., prevent scroll.
    if (e.target !== document && e.target !== document.body) {
      e.preventDefault()
    }
  })

  // Run threads
  vm.start()
}
