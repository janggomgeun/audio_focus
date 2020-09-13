export default class CommandManager {
    addOnCommandListener(onCommand) {
        chrome.commands.onCommand.addListener(onCommand)
    }
}