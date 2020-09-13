export default class PageMessageHandler {
    constructor(window, eventList) {
        this.window = window

        for (const eventName of Object.keys(eventList)) {
            const eventCallback = eventList[eventName]
            window.addEventListener(eventName, eventCallback)
        }
    }
}