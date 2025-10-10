const { TextChannel, MessagePayload, MessageCreateOptions } = require("discord.js");

module.exports = {
    /**
     * @param {TextChannel} channel 
     * @param {string | MessagePayload | MessageCreateOptions} options 
     * @return {Promise<Message<true>>}
     */
    async send(channel, options){
        try{
            await channel.send(options);
        }
        catch(e){
            // Ignore error, safe discord was used to ignore this error.
        }
    }
};