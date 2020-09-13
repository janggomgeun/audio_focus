export default class PageMediaStateTracker {

    constructor(onPageMediaPlaying, onPageMediaStopped) {
        this.id = 0
        this.mediaElements = []
        this.numPlayingMedias = 0;
        this.onPageMediaPlaying = onPageMediaPlaying
        this.onPageMediaStopped = onPageMediaStopped
    }

    addMediaElement(mediaElement) {
        this.mediaElements.push(mediaElement)
        if (mediaElement.playing) {
            this.increaseNumPlayingMedias()
        }
        this.track(mediaElement)
    }

    checkState() {
        if (this.numPlayingMedias > 0) {
            this.onPageMediaPlaying()
        } else {
            this.onPageMediaStopped()
        }
    }

    reset() {
        this.numPlayingMedias = 0;
        for (const mediaElement of this.mediaElements) {
            if (mediaElement.playing) {
                this.numPlayingMedias++
            }
        }
        if (this.numPlayingMedias > 0) {
            this.onPageMediaPlaying()
        } else {
            this.onPageMediaStopped()
        }
    }

    track(mediaElement) {
        const self = this
        const eventList = {
            'play': function () {
                self.increaseNumPlayingMedias()
            },
            'pause': function () {
                self.decreaseNumPlayingMedias()
            },
            'ended': function () {
                self.decreaseNumPlayingMedias()
            }
        }

        for (const eventName of Object.keys(eventList)) {
            const eventCallback = eventList[eventName]
            mediaElement.addEventListener(eventName, eventCallback)
        }
    }

    increaseNumPlayingMedias() {
        if (this.numPlayingMedias === 0) {
            this.onPageMediaPlaying()
        }
        this.numPlayingMedias++
    }

    decreaseNumPlayingMedias() {
        this.numPlayingMedias--
        if (this.numPlayingMedias === 0) {
            this.onPageMediaStopped()
        }
    }
}