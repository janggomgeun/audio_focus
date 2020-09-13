import { default as AudioBlurSystemMaster } from './web/audio-blur-system-master';
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
  console.log('af-clear');
  mediaElementManager.update()
  audioBlurSystemMaster.clear()
})

window.addEventListener('af-blur', function(event) {
  console.log('af-blur');
  mediaElementManager.update()
  audioBlurSystemMaster.blur()
})

console.log('===============================================================================');
