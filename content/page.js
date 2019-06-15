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

function searchVideoElements() {

}

function searchAudioElements() {

}

window.addEventListener('load', function() {
  var focusMediaElementIndex = -1
  var mediaElements = document.getElementsByTagName('video')
  var audioBlurNodesList = []
  for (var i = 0; i < mediaElements.length; i++) {
    var mediaElement = mediaElements[i]
    audioBlurNodesList.push(new AudioBlurEffect(new (AudioContext || webkitAudioContext)(), mediaElement))
  }
  enableAllAudioBlurEffects(audioBlurNodesList)
})

window.addEventListener('ENABLE', function(event) {
  enableAllAudioBlurEffects(audioBlurNodesList)
})

window.addEventListener('DISABLE', function(event) {
  disableAllAudioBlurEffects(audioBlurNodesList)
})

window.postMessage({

})
