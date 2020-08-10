Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
  get: function(){
      return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
  }
})

class AudioBlurNode {
  constructor(audioContext) {
    if (!audioContext) {
      console.error("AudioBlurNode::constructor(undefined)");
    }

    let biquadFilterNode = audioContext.createBiquadFilter()
    biquadFilterNode.type = "lowpass"
    biquadFilterNode.frequency.setValueAtTime(200, audioContext.currentTime)

    let gainNode = audioContext.createGain()
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)

    biquadFilterNode.connect(gainNode)

    this.in = biquadFilterNode
    this.out = gainNode
  }
}

/* 
 * an AudioBlurSystem has only one media element  
*/
const AUDIO_SYSTEM_STATUS_NONE = 0
const AUDIO_SYSTEM_STATUS_ENABLED = 1
const AUDIO_SYSTEM_STATUS_DISABLED = 2
class AudioBlurSystem {
  constructor(audioContext, mediaElement) {
    this.status = AUDIO_SYSTEM_STATUS_NONE
    this.mediaElement = mediaElement
    this.sourceNode = audioContext.createMediaElementSource(this.mediaElement)
    this.audioBlurNode = new AudioBlurNode(audioContext)
    this.destinationNode = audioContext.destination
    this.clear()
  }

  blur() {
    switch (this.status) {
      case AUDIO_SYSTEM_STATUS_DISABLED:
        this.disconnect(this.sourceNode, this.destinationNode)
        break;
    }
    this.connect(this.sourceNode, this.audioBlurNode.in)
    this.connect(this.audioBlurNode.out, this.destinationNode)
    this.status = AUDIO_SYSTEM_STATUS_ENABLED
  }

  clear() {
    switch (this.status) {
      case AUDIO_SYSTEM_STATUS_ENABLED:
        this.disconnect(this.sourceNode, this.audioBlurNode.in)
        this.disconnect(this.audioBlurNode.out, this.destinationNode)
        break;
    }
    this.connect(this.sourceNode, this.destinationNode)
    this.status = AUDIO_SYSTEM_STATUS_DISABLED
  }

  connect(from, to) {
    from.connect(to)
  }

  disconnect(from, to) {
    from.disconnect(to)
  }
}

class PageMediaStateTracker {

  constructor(onPageMediaPlaying, onPageMediaStopped) {
    this.id = 0
    this.mediaElements = []
    this.numPlayingMedias = 0;
    this.onPageMediaPlaying = onPageMediaPlaying
    this.onPageMediaStopped = onPageMediaStopped
  }

  addMediaElement(mediaElement) {
    this.mediaElements.push(mediaElement)
    if (mediaElement.playing) {
      this.increaseNumPlayingMedias()
    }
    this.track(mediaElement)
  }

  checkState() {
    if (this.numPlayingMedias > 0) {
      this.onPageMediaPlaying()
    } else {
      this.onPageMediaStopped()
    }
  }

  reset() {
    this.numPlayingMedias = 0;
    for (const mediaElement of this.mediaElements) {
      if(mediaElement.playing) {
        this.numPlayingMedias++
      }
    }
    if (this.numPlayingMedias > 0) {
      this.onPageMediaPlaying()
    } else {
      this.onPageMediaStopped()
    }
  }

  track(mediaElement) {
    const self = this
    const eventList = {
      'play': function() {
        self.increaseNumPlayingMedias()
      },
      'pause': function() {
        self.decreaseNumPlayingMedias()
      },
      'ended': function() {
        self.decreaseNumPlayingMedias()
      }
    }

    for (const eventName of Object.keys(eventList)) {
      const eventCallback = eventList[eventName]
      mediaElement.addEventListener(eventName, eventCallback)
    }
  }

  increaseNumPlayingMedias() {
    if (this.numPlayingMedias === 0) {
      this.onPageMediaPlaying()
    }
    this.numPlayingMedias++
  }

  decreaseNumPlayingMedias() {
    this.numPlayingMedias--
    if (this.numPlayingMedias === 0) {
      this.onPageMediaStopped()
    }
  }
}

class MediaElementManager {
  constructor(onNewMediaElementsAddedEvent) {
    this.mediaElements = []
    this.newMediaElements = null
    this.onNewMediaElementsAddedEvent = onNewMediaElementsAddedEvent
  }

  update() {
    let newAllMediaElements = this.findAllMediaElements()
    let oldAllMediaElements = this.mediaElements
    this.newMediaElements = newAllMediaElements.filter(function(obj) {
      return oldAllMediaElements.indexOf(obj) == -1
    })

    if (this.onNewMediaElementsAddedEvent) {
      this.onNewMediaElementsAddedEvent(this.newMediaElements);
    }
    this.mediaElements = this.mediaElements.concat(this.newMediaElements)
    this.newMediaElements = null
  }

  findAllVideoElements() {
    return document.getElementsByTagName('video')
  }

  findAllAudioElements() {
    return document.getElementsByTagName('audio')
  }

  findAllMediaElements() {
    return [
      ...this.findAllVideoElements(),
      ...this.findAllAudioElements()
    ]
  }
}

class State {
  constructor() {
    this.options = {
      focus: 'always-focus',
    }
  }
}

class AudioBlurSystemMaster {
  constructor(audioBlurSystems) {
    this.audioBlurSystems = audioBlurSystems
  }

  blur() {
    this.audioBlurSystems.forEach(function(audioBlurSystem) {
      audioBlurSystem.blur()
    })
  }

  clear() {
    this.audioBlurSystems.forEach(function(audioBlurSystem) {
      audioBlurSystem.clear()
    })
  }
}

let tabActive = false
let isInit = false
const state = new State()
const audioBlurSystems = []
const audioBlurSystemMaster = new AudioBlurSystemMaster(audioBlurSystems)

const onPageMediaPlaying = function() {
  if (tabActive && state.options.focus === 'focus-playing-media') {
    const pageMediaPlayingEvent = new CustomEvent('af-page-media-playing')
    window.dispatchEvent(pageMediaPlayingEvent)
  }
}

const onPageMediaStopped = function() {
  if (tabActive && state.options.focus === 'focus-playing-media') {
    const pageMediaStoppedEvent = new CustomEvent('af-page-media-stopped')
    window.dispatchEvent(pageMediaStoppedEvent)
  }
}

const pageMediaStateTracker = new PageMediaStateTracker(onPageMediaPlaying, onPageMediaStopped)
const mediaElementManager = new MediaElementManager(function(newMediaElements) {
  for (const newMediaElement of newMediaElements) {
    audioBlurSystems.push(
      new AudioBlurSystem(
        new (AudioContext || webkitAudioContext)(),
        newMediaElement
      )
    )
    pageMediaStateTracker.addMediaElement(newMediaElement)
  }
})

class PageMessageHandler {
  constructor(window, eventList) {
    this.window = window
    
    for (const eventName of Object.keys(eventList)) {
      const eventCallback = eventList[eventName] 
      window.addEventListener(eventName, eventCallback)
    }
  }
}

new PageMessageHandler(window, {
  'af_tab_active': function (event) {
    tabActive = true
    if (!isInit) return false
    switch(state.options.focus) {
      case 'always-focus':
      case 'focus-playing-media':
        mediaElementManager.update()
        audioBlurSystemMaster.clear()
        pageMediaStateTracker.checkState()
        break
    }
  },
  'af_tab_inactive': function (event) {
    tabActive = false
    if (!isInit) return false
    mediaElementManager.update()
    switch(state.options.focus) {

      case 'always-focus':
        audioBlurSystemMaster.blur()
        break

      case 'focus-media-playing':
        audioBlurSystemMaster.clear()
        break
    }
  },
  'af_update': function (event) {
    if (!isInit) return false
    mediaElementManager.update()
    pageMediaStateTracker.reset()
  },
  'af_off': function (event) {
    if (!isInit) return false
    tabActive = false
    audioBlurSystemMaster.clear()
  },
  'af_tab_options_always_focus': function (event) {
    if (!isInit) return false
    state.options.focus = 'always-focus'
    if (tabActive) {
      mediaElementManager.update()
      audioBlurSystemMaster.clear()
    } else {
      mediaElementManager.update()
      audioBlurSystemMaster.blur()
    }
  },
  'af_tab_options_focus_playing_media': function(event) {
    if (!isInit) return false
    state.options.focus = 'focus-playing-media'
    mediaElementManager.update()
    audioBlurSystemMaster.clear()
  },
  'af_tab_init_options_always_focus': function (event) {
    if (isInit) {
      return
    }
    isInit = true
    state.options.focus = 'always-focus'
    if (tabActive) {
      mediaElementManager.update()
      audioBlurSystemMaster.clear()
    } else {
      mediaElementManager.update()
      audioBlurSystemMaster.blur()
    }
  },
  'af_tab_init_options_focus_playing_media': function(event) {
    if (isInit) {
      return
    }
    isInit = true
    state.options.focus = 'focus-playing-media'

    mediaElementManager.update()
    audioBlurSystemMaster.clear()
  },
  'af_blur': function (event) {
    if (!isInit) return false
    mediaElementManager.update()
    audioBlurSystemMaster.blur()
  },
  'af_clear': function (event) {
    if (!isInit) return false
    mediaElementManager.update()
    audioBlurSystemMaster.clear()
  }
})

const pageInit = new CustomEvent('af-page-init')
window.dispatchEvent(pageInit)