const logger = require("#root/src/Logger.js");

class InteractionManager {
    /**
     * @type {import("../DiscordApproach")}
     */
    discord;

    constructor(discord_instance) {
        this.discord = discord_instance;
    }

    /**
     * @param {import("discord.js").CommandInteraction} interaction 
     */
    async handle(interaction) {
        if (interaction.isChatInputCommand()) {
            await interaction.deferReply({ ephemeral: false }).catch((e) => {
                logger.warn(`Error while deferring reply.`, e);
            });

            const command = this.discord.commands.get(interaction.commandName);
            if (command === undefined) {
                return;
            }

            await command.execute(interaction);
        }
    }
}

module.exports = InteractionManager;