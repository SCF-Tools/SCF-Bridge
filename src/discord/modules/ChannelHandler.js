const { TextChannel } = require("discord.js");
const DiscordApproach = require("../DiscordApproach");

class ChannelHandler {
    /**
     * @type {DiscordApproach}
     */
    discord;

    constructor(discord) {
        this.discord = discord;
    }

    /**
     * @returns {TextChannel}
     */
    get(channel_type) {
        let id = this.discord.config.channels?.[channel_type] ?? channel_type;
        return this.discord.client.channels.cache.get(id);
    }
}

module.exports = ChannelHandler;