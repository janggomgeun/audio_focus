export default class MediaElementManager {
    constructor(onNewMediaElementsAddedEvent) {
        this.mediaElements = []
        this.newMediaElements = null
        this.onNewMediaElementsAddedEvent = onNewMediaElementsAddedEvent
    }

    update() {
        let newAllMediaElements = this.findAllMediaElements()
        let oldAllMediaElements = this.mediaElements
        this.newMediaElements = newAllMediaElements.filter(function (obj) {
            return oldAllMediaElements.indexOf(obj) == -1
        })

        if (this.onNewMediaElementsAddedEvent) {
            this.onNewMediaElementsAddedEvent(this.newMediaElements);
        }
        this.mediaElements = this.mediaElements.concat(this.newMediaElements)
        this.newMediaElements = null
    }

    findAllVideoElements() {
        return document.getElementsByTagName('video')
    }

    findAllAudioElements() {
        return document.getElementsByTagName('audio')
    }

    findAllMediaElements() {
        return [
            ...this.findAllVideoElements(),
            ...this.findAllAudioElements()
        ]
    }
}