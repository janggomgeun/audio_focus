const EFFECT_STATUS_NONE = 0
const EFFECT_STATUS_ENABLED = 1
const EFFECT_STATUS_DISABLED = 2

function AudioBlurEffect(audioContext, mediaElement) {
  this.mediaElement = mediaElement
  this.audioContext = audioContext
  this.build(this.audioContext, this.mediaElement)
}

AudioBlurEffect.prototype.build = function (audioContext, mediaElement) {
  this.status = EFFECT_STATUS_NONE

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

AudioBlurEffect.prototype.enable = function () {
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

AudioBlurEffect.prototype.disable = function () {
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

AudioBlurEffect.prototype.connect = function (from, to) {
  from.connect(to)
};

AudioBlurEffect.prototype.disconnect = function (from, to) {
  from.disconnect(to)
};

function enableAllAudioBlurEffects(audioBlurNodesList) {
  for (var i = 0; i < audioBlurNodesList.length; i++) {
    audioBlurNodesList[i].enable()
  }
}

function disableAllAudioBlurEffects(audioBlurNodesList) {
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

window.addEventListener('load', function() {
  var focusMediaElementIndex = -1
  var mediaElements = getAllMediaElements()
  var audioBlurEffectList = []

  var isPlaying = false
  var isFocusAudio = false
  for (var i = 0; i < mediaElements.length; i++) {
    var mediaElement = mediaElements[i]

    mediaElement.addEventListener('play', function() {

    })

    mediaElement.addEventListener('ended', function() {

    })

    mediaElement.addEventListener('pause', function() {

    })

    audioBlurEffectList.push(
      new AudioBlurEffect(
        new (AudioContext || webkitAudioContext)(),
        mediaElement
      )
    )
  }
  enableAllAudioBlurEffects(audioBlurEffectList)
})

window.addEventListener('ENABLE', function(event) {
  enableAllAudioBlurEffects(audioBlurNodesList)
})

window.addEventListener('DISABLE', function(event) {
  disableAllAudioBlurEffects(audioBlurNodesList)
})

window.addEventListener('UPDATE', function(event) {
  console.log('This tab is updated');
})

// window.postMessage({
//   type: "REQUEST",
//   what: ""
// })
