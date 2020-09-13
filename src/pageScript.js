const { default: AudioBlurSystemMaster } = require('./web/audio-blur-system-master');
const { default: PageMediaStateTracker } = require('./web/page-media-state-tracker');
const { default: MediaElementManager } = require('./web/media-element-manager');

Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
  get: function () {
    return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
  }
})

const audioBlurSystems = []
const audioBlurSystemMaster = new AudioBlurSystemMaster(audioBlurSystems)

const onPageMediaPlaying = function () {
  if (tabActive && state.options.focus === 'focus-playing-media') {
    const pageMediaPlayingEvent = new CustomEvent('af-page-media-playing')
    window.dispatchEvent(pageMediaPlayingEvent)
  }
}

const onPageMediaStopped = function () {
  if (tabActive && state.options.focus === 'focus-playing-media') {
    const pageMediaStoppedEvent = new CustomEvent('af-page-media-stopped')
    window.dispatchEvent(pageMediaStoppedEvent)
  }
}

const pageMediaStateTracker = new PageMediaStateTracker(onPageMediaPlaying, onPageMediaStopped)
const mediaElementManager = new MediaElementManager(function (newMediaElements) {
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

const pageInit = new CustomEvent('af-page-init')
window.dispatchEvent(pageInit)
window.postMessage({ type: "FROM_PAGE", text: "Hello from the webpage!" }, "*");
