import AudioBlurNode from "./audio-blur-node";

const AUDIO_SYSTEM_STATUS_NONE = 0
const AUDIO_SYSTEM_STATUS_ENABLED = 1
const AUDIO_SYSTEM_STATUS_DISABLED = 2

export default class AudioBlurSystem {
    constructor(audioContext, mediaElement) {
        this.status = AUDIO_SYSTEM_STATUS_NONE
        this.mediaElement = mediaElement
        this.sourceNode = audioContext.createMediaElementSource(this.mediaElement)
        this.audioBlurNode = new AudioBlurNode(audioContext)
        this.destinationNode = audioContext.destination
        this.clear()
    }

    blur() {
        switch (this.status) {
            case AUDIO_SYSTEM_STATUS_DISABLED:
                this.disconnect(this.sourceNode, this.destinationNode)
                break;
        }
        this.connect(this.sourceNode, this.audioBlurNode.in)
        this.connect(this.audioBlurNode.out, this.destinationNode)
        this.status = AUDIO_SYSTEM_STATUS_ENABLED
    }

    clear() {
        switch (this.status) {
            case AUDIO_SYSTEM_STATUS_ENABLED:
                this.disconnect(this.sourceNode, this.audioBlurNode.in)
                this.disconnect(this.audioBlurNode.out, this.destinationNode)
                break;
        }
        this.connect(this.sourceNode, this.destinationNode)
        this.status = AUDIO_SYSTEM_STATUS_DISABLED
    }

    connect(from, to) {
        from.connect(to)
    }

    disconnect(from, to) {
        from.disconnect(to)
    }
}