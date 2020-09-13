export default class AudioBlurNode {
    constructor(audioContext) {
        if (!audioContext) {
            console.error("AudioBlurNode::constructor(undefined)");
        }

        let biquadFilterNode = audioContext.createBiquadFilter()
        biquadFilterNode.type = "lowpass"
        biquadFilterNode.frequency.setValueAtTime(200, audioContext.currentTime)

        let gainNode = audioContext.createGain()
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)

        biquadFilterNode.connect(gainNode)

        this.in = biquadFilterNode
        this.out = gainNode
    }
}