const MinecraftRawEvent = require("#shared/Events/MinecraftRawEvent.js");
const config = require("#root/Config.js").get();

const Permissions = require("../modules/PermissionManager.js");

class MessageManager {
    /**
     * @type {import("../DiscordApproach")}
     */
    discord;

    constructor(discord_instance) {
        this.discord = discord_instance;
    }

    /**
     * @param {import("discord.js").Message} message 
     */
    async handle(message) {
        if (!Object.values(this.discord.config.channels).includes(message.channel.id)) {
            return; // We are not listening to these channels.
        }

        if (message.author.id == this.discord.client.user.id) {
            return; // We are not listening to ourselves.
        }

        if(message.author.bot && !config.allowed_bots.includes(message.author.id)){
            return; // We are not listening to bot messages.
        }

        if (message.channel.id === this.discord.config.channels.console) {
            let can_execute = Permissions.canExecute(message.member, Permissions.tiers.COUNCIL, true);
            if (!can_execute) {
                message.react("❌");
                return;
            }

            let event = new MinecraftRawEvent(this.discord.id, message.content);
            this.discord.emitEvent(event);
            return;
        }

    }
}

module.exports = MessageManager;