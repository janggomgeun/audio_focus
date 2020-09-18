export default class AudioBlurSystemMaster {
    constructor(audioBlurSystems) {
        this.audioBlurSystems = audioBlurSystems
    }

    blur() {
        this.audioBlurSystems.forEach(function (audioBlurSystem) {
            audioBlurSystem.blur()
        })
    }

    focus() {
        this.audioBlurSystems.forEach(function (audioBlurSystem) {
            audioBlurSystem.focus()
        })
    }
}