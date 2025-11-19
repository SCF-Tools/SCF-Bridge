const InboundMinecraftMessage = require("#shared/Events/InboundMinecraftMessage.js")

class MessageManager {
    /**
     * @type {import("../MinecraftApproach")}
     */
    minecraft;

    constructor(minecraft_instance) {
        this.minecraft = minecraft_instance;
    }

    async handle(message) {
        /**
         * @type {String}
         */
        const cleanMessage = message.toString();
        /**
         * @type {String}
         */
        const coloredMessage = message.toMotd();

        this.minecraft.emitEvent(new InboundMinecraftMessage(this.minecraft.id, cleanMessage, coloredMessage)).catch((e) => {
            console.log(e);
        });

        if (cleanMessage.includes(' the lobby!') && cleanMessage.includes('[MVP+') && !cleanMessage.includes(':')) {
            this.minecraft.bot.chat('/limbo');
            return;
        }
        if (cleanMessage.includes('You are currently connected to') && !cleanMessage.includes(':')) {
            this.minecraft.bot.chat('/limbo');
            return;
        }
    }
}

module.exports = MessageManager;
