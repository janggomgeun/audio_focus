import { default as AudioBlurSystemMaster } from './web/audio-blur-system-master';
import { default as AudioBlurSystem } from './web/audio-blur-system';
import { default as MediaElementManager } from './web/media-element-manager';

const audioBlurSystems = []
const audioBlurSystemMaster = new AudioBlurSystemMaster(audioBlurSystems)
const mediaElementManager = new MediaElementManager(function (newMediaElements) {
  for (const newMediaElement of newMediaElements) {
    audioBlurSystems.push(
      new AudioBlurSystem(
        new (AudioContext || webkitAudioContext)(),
        newMediaElement
      )
    )
  }
})

window.addEventListener('af-clear', function(event) {
  mediaElementManager.update()
  audioBlurSystemMaster.clear()
})

window.addEventListener('af-blur', function(event) {
  mediaElementManager.update()
  audioBlurSystemMaster.blur()
})
