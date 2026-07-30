const OutboundMinecraftMessage = require("#shared/Events/OutboundMinecraftMessage.js");
const InboundDiscordMessage = require("#shared/Events/InboundDiscordMessage.js");

class ExternalEventManager {
    /**
     * @type {import("../MinecraftApproach")}
     */
    minecraft;

    constructor(minecraft_instance) {
        this.minecraft = minecraft_instance;
    }

    /**
     * @param {import("#shared/Events/GenericEvent.js")} event
     */
    async handle(event) {
        if (!this.minecraft.isConnected()) {
            return;
        }

        if (event instanceof OutboundMinecraftMessage) {
            const command = event.payload.message.toString().slice(0, 250);
            
            this.minecraft.bot.chat(command);
        }

        if (event instanceof InboundDiscordMessage) {
            const channels = event.channels;
            const message = event.payload.message;
            const nick = event.payload.player.display_name;
            let channel = '/gc';

            if (event.payload.channel == channels.OFFICER) channel = '/oc';

            let command = `${channel} ${nick} » ${message}`.toString().slice(0, 250);

            if (event.payload.channel == channels.CONSOLE) {
                command = `${message}`.toString().slice(0, 250);
            }
            
            this.minecraft.bot.chat(command);
        }
    }
}

module.exports = ExternalEventManager;
