const GenericEvent = require("#root/shared/Events/GenericEvent.js");

class MessageManager{
    /**
     * @type {import("../DiscordApproach")}
     */
    discord;

    constructor(discord_instance){
        this.discord = discord_instance;
    }

    /**
     * @param {import("discord.js").Message} message 
     */
    async handle(message){
        let event = new GenericEvent(this.discord.id);
        this.discord.emitEvent(event);
    }
}

module.exports = MessageManager;