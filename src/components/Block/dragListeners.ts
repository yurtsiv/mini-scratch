import { Coords } from 'lib/types'
import { BlockPath, DropDir } from 'state/scriptEditor'

export class BlockDragState {
  static dragListeners: any = {}
  static dragEndListeners: any = {}
  static dropSuggestion: {
    dropDir: DropDir
    blockPath: BlockPath
  } | null = null
  static blockToRemove: BlockPath | null = null
  static dragCoords: Coords | null = null

  static onDrag(cb: (coords: Coords, path: BlockPath) => void) {
    const handle = Symbol('drag-listener-key')
    this.dragListeners[handle] = cb
    return handle
  }

  static removeOnDrag(handle: symbol) {
    delete this.dragListeners[handle]
  }

  static notifyOnDrag(coords: Coords, path: BlockPath) {
    Reflect.ownKeys(this.dragListeners).forEach((key) =>
      this.dragListeners[key](coords, path)
    )
  }

  static onDragEnd(cb: () => void) {
    const handle = Symbol('drag-end-listener-key')
    this.dragEndListeners[handle] = cb
    return handle
  }

  static removeOnDragEnd(handle: symbol) {
    delete this.dragEndListeners[handle]
  }

  static notifyOnDragEnd() {
    Reflect.ownKeys(this.dragEndListeners).forEach((key) =>
      this.dragEndListeners[key]()
    )
  }
}
