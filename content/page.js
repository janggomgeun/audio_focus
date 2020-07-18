
class AudioBlurNode {
  constructor(audioContext) {
    if (!audioContext)
      console.error("AudioBlurNode::constructor(undefined)");

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

const AUDIO_SYSTEM_STATUS_NONE = 0
const AUDIO_SYSTEM_STATUS_ENABLED = 1
const AUDIO_SYSTEM_STATUS_DISABLED = 2
class AudioBlurSystem {
  constructor(audioContext, mediaElement) {
    this.status = AUDIO_SYSTEM_STATUS_NONE
    this.sourceNode = audioContext.createMediaElementSource(mediaElement)
    this.audioBlurNode = new AudioBlurNode(audioContext)
    this.destinationNode = audioContext.destination
    this.disable()
  }

  enable() {
    switch (this.status) {
      case AUDIO_SYSTEM_STATUS_DISABLED:
      this.disconnect(this.sourceNode, this.destinationNode)
      break;
      default:
    }
    this.connect(this.sourceNode, this.audioBlurNode.in)
    this.connect(this.audioBlurNode.out, this.destinationNode)
    this.status = AUDIO_SYSTEM_STATUS_ENABLED
  }

  disable() {
    switch (this.status) {
      case AUDIO_SYSTEM_STATUS_ENABLED:
      this.disconnect(this.sourceNode, this.audioBlurNode.in)
      this.disconnect(this.audioBlurNode.out, this.destinationNode)
      break;
      default:
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

class MediaElementManager {
  constructor() {
    this.originalMediaElements = []
    this.diff = []
  }

  update() {
    let newlyFoundMediaElements = this.findAllMediaElements()
    let originalMediaElements = this.originalMediaElements
    let newlyAddedMediaElements = newlyFoundMediaElements.filter(function(obj) {
      return originalMediaElements.indexOf(obj) == -1
    })

    this.diff = newlyAddedMediaElements

    this.originalMediaElements = this.originalMediaElements.concat(this.diff)
  }

  findAllVideoElements() {
    return document.getElementsByTagName('video')
  }

  findAllAudioElements() {
    return document.getElementsByTagName('audio')
  }

  findAllMediaElements() {
    var medias = []
    var videos = this.findAllVideoElements()
    var audios = this.findAllAudioElements()
    for (var i = 0; i < videos.length; i++) {
      medias.push(videos[i])
    }
    for (var i = 0; i < audios.length; i++) {
      medias.push(audios[i])
    }
    return medias
  }
}

class AudioBlurSystemMaster {
  constructor() {
    this.audioBlurSystems = []
    this.mediaElementManager = new MediaElementManager()
    this.isInitialized = false
    
  }

  update() {
    this.mediaElementManager.update()
    let mediaElements = this.mediaElementManager.diff
    for (var i = 0; i < mediaElements.length; i++) {
      let mediaElement = mediaElements[i]
      this.audioBlurSystems.push(
        new AudioBlurSystem(
          new (AudioContext || webkitAudioContext)(),
          mediaElement
        )
      )
    }
  }

  enable() {
    for (var i = 0; i < this.audioBlurSystems.length; i++) {
      this.audioBlurSystems[i].enable()
    }
  }

  disable() {
    for (var i = 0; i < this.audioBlurSystems.length; i++) {
      this.audioBlurSystems[i].disable()
    }
  }
}

let audioBlurSystemMaster = new AudioBlurSystemMaster()

window.addEventListener('af_focus', function(event) {
  audioBlurSystemMaster.update()
  audioBlurSystemMaster.disable()
})

window.addEventListener('af_focusout', function(event) {
  audioBlurSystemMaster.update()
  audioBlurSystemMaster.enable()
})

window.addEventListener('af_back', function(event) {
  audioBlurSystemMaster.disable()
})
