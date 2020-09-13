const AudioBlurSystemMaster = import('./web/audio-blur-system-master')
const PageMediaStateTracker = import('./web/page-media-state-tracker')
const MediaElementManager = import ('./web/media-element-manager')
const PageMessageHandler = import('./web/page-message-handler')

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