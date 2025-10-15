const DiscordConsoleEvent = require("#shared/Events/DiscordConsoleEvent.js");

/**
 * @typedef {Object} ChatMessage
 * @property {any} message.json - Raw JSON representation of the message
 * @property {Function} message.append
 * @property {Function} message.clone
 * @property {Object[]} [message.extra]
 * @property {string} [message.translate]
 * @property {Function} message.toString
 * @property {Function} message.toMotd
 * @property {Function} message.toAnsi
 * @property {Function} message.toHTML
 * @property {Function} message.length
 * @property {Function} message.getText
 * @property {Function} message.valueOf
 */

class MessageManager {
    /**
     * @type {import("../MinecraftApproach")}
     */
    minecraft;

    constructor(minecraft_instance) {
        this.minecraft = minecraft_instance;
    }

    /**
     * @param {ChatMessage} message
     */
    async handle(message) {
        const cleanMessage = message.toString();
        const coloredMessage = message.toMotd();

        this.minecraft.emitEvent(new DiscordConsoleEvent(this.minecraft.id, coloredMessage)).catch(e => { console.log(e) });

        if (cleanMessage.includes(' the lobby!') && cleanMessage.includes('[MVP+')) {
            this.minecraft.bot.chat("/limbo");
        }
    }
}

module.exports = MessageManager;