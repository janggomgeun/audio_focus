
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
    console.log("page.js::MediaElementManager::update() starts");

    let newlyFoundMediaElements = this.findAllMediaElements()
    console.log('newlyFoundMediaElements')
    console.log(newlyFoundMediaElements)

    let originalMediaElements = this.originalMediaElements
    console.log('originalMediaElements')
    console.log(originalMediaElements)

    let newlyAddedMediaElements = newlyFoundMediaElements.filter(function(obj) {
      return originalMediaElements.indexOf(obj) == -1
    })

    this.diff = newlyAddedMediaElements
    console.log(newlyAddedMediaElements);
    console.log("page.js::MediaElementManager::update() ends");

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
    console.log("page.js::AudioBlurSystemMaster::update() starts");
    this.mediaElementManager.update()
    let mediaElements = this.mediaElementManager.diff
    console.log(mediaElements);
    for (var i = 0; i < mediaElements.length; i++) {
      let mediaElement = mediaElements[i]
      this.audioBlurSystems.push(
        new AudioBlurSystem(
          new (AudioContext || webkitAudioContext)(),
          mediaElement
        )
      )
    }
    console.log("page.js::AudioBlurSystemMaster::update() ends");
  }

  enable() {
    console.log("page.js::AudioBlurSystemMaster::enable() starts")
    for (var i = 0; i < this.audioBlurSystems.length; i++) {
      console.log("page.js::AudioBlurSystemMaster::enable() loop")
      this.audioBlurSystems[i].enable()
    }
  }

  disable() {
    console.log("page.js::AudioBlurSystemMaster::disable() starts");
    for (var i = 0; i < this.audioBlurSystems.length; i++) {
      console.log("page.js::AudioBlurSystemMaster::disable() loops");
      this.audioBlurSystems[i].disable()
    }
  }
}

let audioBlurSystemMaster = new AudioBlurSystemMaster()

window.addEventListener('af_focus', function(event) {
  console.log('page.js::af_focus')
  audioBlurSystemMaster.update()
  audioBlurSystemMaster.disable()
})

window.addEventListener('af_focusout', function(event) {
  console.log('page.js::af_focusout')
  audioBlurSystemMaster.update()
  audioBlurSystemMaster.enable()
})

window.addEventListener('af_back', function(event) {
  console.log('page.js::af_back')
  audioBlurSystemMaster.disable()
})
