export default class AudioBlurSystemMaster {
    constructor(audioBlurSystems) {
        this.audioBlurSystems = audioBlurSystems
    }

    blur() {
        this.audioBlurSystems.forEach(function (audioBlurSystem) {
            audioBlurSystem.blur()
        })
    }

    clear() {
        this.audioBlurSystems.forEach(function (audioBlurSystem) {
            audioBlurSystem.clear()
        })
    }
}