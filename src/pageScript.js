import { default as AudioBlurSystemMaster } from './web/audio-blur-system-master';
import { default as PageMediaStateTracker } from './web/page-media-state-tracker';
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

// window.addEventListener('message', )