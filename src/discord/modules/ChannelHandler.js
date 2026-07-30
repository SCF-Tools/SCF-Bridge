class ChannelHandler {
    /**
     * @type {import("../DiscordApproach.js")}
     */
    discord;

    constructor(discord) {
        this.discord = discord;
    }

    /**
     * @returns {import("discord.js").TextChannel}
     */
    get(channel_type) {
        const id = this.discord.config.channels?.[channel_type] ?? channel_type;
        return this.discord.client.channels.cache.get(id);
    }
}

module.exports = ChannelHandler;
