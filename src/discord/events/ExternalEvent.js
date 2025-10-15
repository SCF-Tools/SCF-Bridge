const DiscordConsoleEvent = require("#shared/Events/DiscordConsoleEvent.js");
const GenericEvent = require("#shared/Events/GenericEvent.js");
const { AttachmentBuilder } = require("discord.js");
const messageToImage = require("#shared/ImageRenderer/messageToImage.js");

class ExternalEventManager {
    /**
     * @type {import("../DiscordApproach")}
     */
    discord;

    constructor(discord_instance) {
        this.discord = discord_instance;
    }

    /**
     * @param {GenericEvent} event 
     */
    async handle(event) {
        if (event instanceof DiscordConsoleEvent) {
            const console_channel = this.discord.channels.get("console");

            await console_channel.send({
                files: [
                    new AttachmentBuilder(
                        await messageToImage(event.payload.message), {
                            name: `message.png`
                        }
                    )
                ]
            });
        }

    }
}

module.exports = ExternalEventManager;