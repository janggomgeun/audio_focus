import { USER_SETTINGS } from "../config"

export class Storage {
  constructor(schema, onChanged) {
    this.schema = schema
    this.onChanged = onChanged
    this.data = undefined
  }

  async load() {
    const self = this
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([USER_SETTINGS], function(result) {
        resolve()
      })
    })
  }

  async registerSchema(schema) {
    const self = this
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(self.schema, function() {
        resolve()
      })
    })
  }

  async addOnChangedListener(onChanged) {
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      switch(namespace) {
        case 'sync':
          onChanged(changes)
          break
      }
    })
  }
}