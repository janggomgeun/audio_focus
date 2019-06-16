const EFFECT_STATUS_NONE = 0
const EFFECT_STATUS_ENABLED = 1
const EFFECT_STATUS_DISABLED = 2

function AudioBlurEffectNode(audioContext, mediaElement) {
  this.status = EFFECT_STATUS_NONE
  this.mediaElement = mediaElement
  this.audioContext = audioContext
  this.build(this.audioContext, this.mediaElement)
}

AudioBlurEffectNode.prototype.build = function (audioContext, mediaElement) {

  this.sourceNode = audioContext.createMediaElementSource(mediaElement)

  this.gainNode = audioContext.createGain()
  this.gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)

  this.biquadFilterNode = audioContext.createBiquadFilter()
  this.biquadFilterNode.type = "lowpass"
  // The cutoff frequency
  this.biquadFilterNode.frequency.setValueAtTime(200, audioContext.currentTime)
  // Q indicates how peaked the frequency is around the cutoff.
  // The greater the value is, the greater is the peak.
  // this.biquadFilterNode.q.setValueAtTime(25, audioContext.currentTime)

  this.destinationNode = audioContext.destination
};

AudioBlurEffectNode.prototype.enable = function () {
  switch (this.status) {
    case EFFECT_STATUS_DISABLED:
    this.disconnect(this.sourceNode, this.destinationNode)
      break;
    default:
  }
  this.connect(this.sourceNode, this.biquadFilterNode)
  this.connect(this.biquadFilterNode, this.gainNode)
  this.connect(this.gainNode, this.destinationNode)
  this.status = EFFECT_STATUS_ENABLED
};

AudioBlurEffectNode.prototype.disable = function () {
  switch (this.status) {
    case EFFECT_STATUS_ENABLED:
    this.disconnect(this.sourceNode, this.biquadFilterNode)
    this.disconnect(this.biquadFilterNode, this.gainNode)
    this.disconnect(this.gainNode, this.destinationNode)
      break;
    default:
  }

  this.connect(this.sourceNode, this.destinationNode)
  this.status = EFFECT_STATUS_DISABLED
};

AudioBlurEffectNode.prototype.connect = function (from, to) {
  from.connect(to)
};

AudioBlurEffectNode.prototype.disconnect = function (from, to) {
  from.disconnect(to)
};

function enableAllAudioBlurEffectNodes(audioBlurNodesList) {
  for (var i = 0; i < audioBlurNodesList.length; i++) {
    audioBlurNodesList[i].enable()
  }
}

function disableAllAudioBlurEffectNodes(audioBlurNodesList) {
  for (var i = 0; i < audioBlurNodesList.length; i++) {
    audioBlurNodesList[i].disable()
  }
}

function getAllVideoElements() {
  return document.getElementsByTagName('video')
}

function getAllAudioElements() {
  return document.getElementsByTagName('audio')
}

function getAllMediaElements() {
  var medias = []
  var videos = getAllVideoElements()
  var audios = getAllAudioElements()
  for (var i = 0; i < videos.length; i++) {
    medias.push(videos[i])
  }
  for (var i = 0; i < audios.length; i++) {
    medias.push(audios[i])
  }
  return medias
}

function IsTheSameElementsInside(elements, target) {
  for (var i = 0; i < elements.length; i++) {
    if (elements[i] === target) {
      return true
    }
  }
  return false
}

function AudioFocusManager () {

}

window.addEventListener('load', function() {
  var focusMediaElementIndex = -1
  var mediaElements = getAllMediaElements()
  var audioBlurEffectNodeList = []

  var isPlaying = false
  var isFocusAudio = false
  for (var i = 0; i < mediaElements.length; i++) {
    var mediaElement = mediaElements[i]

    audioBlurEffectNodeList.push(
      new AudioBlurEffect(
        new (AudioContext || webkitAudioContext)(),
        mediaElement
      )
    )
  }
})

window.addEventListener('enable', function(event) {
  enableAllAudioBlurEffects(audioBlurEffectNodeList)
})

window.addEventListener('focuschanged', function(event) {
  disableAllAudioBlurEffects()
})

window.addEventListener('disable', function(event) {
  disableAllAudioBlurEffects(audioBlurEffectNodeList)
})


// window.postMessage({
//   type: "REQUEST",
//   what: ""
// })
