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
        
    }
}

module.exports = MessageManager;