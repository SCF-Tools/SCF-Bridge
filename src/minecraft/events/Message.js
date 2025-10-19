const DiscordConsoleEvent = require("#shared/Events/DiscordConsoleEvent.js");

/**
 * @typedef {Object} ChatMessage
 * @property {any} json
 * @property {Function} append
 * @property {Function} clone
 * @property {Object[]} [extra]
 * @property {string} [translate]
 * @property {Function} toString
 * @property {Function} toMotd
 * @property {Function} toAnsi
 * @property {Function} toHTML
 * @property {Function} length
 * @property {Function} getText
 * @property {Function} valueOf
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