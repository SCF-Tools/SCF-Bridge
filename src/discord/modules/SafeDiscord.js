module.exports = {
    /**
     * @param {import('discord.js').TextChannel} channel
     * @param {string | import('discord.js').MessagePayload | import('discord.js').MessageCreateOptions} options
     * @return {Promise<import('discord.js').Message<true>|undefined>}
     */
    async send(channel, options) {
        try {
            return await channel.send(options);
        } catch (e) {
            // Ignore error, safe discord was used to ignore this error.
            return undefined;
        }
    }
};
