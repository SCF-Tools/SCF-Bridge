const DiscordCommand = require('../modules/DiscordCommand.js');
const CustomEmbed = require('../modules/CustomEmbed.js');
const branding = require('#root/Branding.js');

class CreditsCommand extends DiscordCommand {
    name = 'credits';
    description = 'Shows the contributions to the code.';
    options = [];

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        let used_sources = "";

        // Developers
        used_sources += "**Developers**\n";
        used_sources += "Artem (<@476365125922586635>)\n";
        used_sources += "Rubiclex (<@199351956320419840>)\n";

        // Used Projects
        used_sources += "\n**Used Projects**\n";
        used_sources += "Implements parts of [DuckySoLucky's Bridge](https://github.com/duckysolucky/hypixel-discord-chat-bridge)\n";
        used_sources += "Uses [SCF API](https://github.com/SCF-Tools/SCF-API-Client)\n";

        const response = new CustomEmbed()
            .setColor(branding.color.success)
            .setTitle('Credits')
            .setDescription(used_sources);

        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new CreditsCommand();
