import {
  default as AudioBlurSystemMaster
} from './web/audio-blur-system-master';
import {
  default as AudioBlurSystem
} from './web/audio-blur-system';
import {
  default as MediaElementManager
} from './web/media-element-manager';
import {
  MESSAGE_AUDIO_BLUR,
  MESSAGE_AUDIO_FOCUS
} from './constants';

const audioBlurSystems = []
const audioBlurSystemMaster = new AudioBlurSystemMaster(audioBlurSystems)
const mediaElementManager = new MediaElementManager(function (newMediaElements) {
  for (const newMediaElement of newMediaElements) {
    audioBlurSystems.push(
      new AudioBlurSystem(
        new(AudioContext || webkitAudioContext)(),
        newMediaElement
      )
    )
  }
})

window.addEventListener(MESSAGE_AUDIO_FOCUS, function (event) {
  mediaElementManager.update()
  audioBlurSystemMaster.focus()
})

window.addEventListener(MESSAGE_AUDIO_BLUR, function (event) {
  mediaElementManager.update()
  audioBlurSystemMaster.blur()
})