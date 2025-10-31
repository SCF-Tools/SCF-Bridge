const DiscordCommand = require('../modules/DiscordCommand.js');
const CustomEmbed = require('../modules/CustomEmbed.js');
const Permissions = require('../modules/PermissionManager.js');

class KillCommand extends DiscordCommand {
    name = 'kill';
    description = 'Completely stop the bridge in case of emergency.';
    options = [];

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        Permissions.canExecute(interaction.member, Permissions.tiers.ADMINISTRATOR);

        setTimeout(() => {
            process.exit(123);
        }, 10_000);

        let response = new CustomEmbed()
            .setColor(0x008000)
            .setTitle('Bridge Kill')
            .setDescription(`The bridge will stop in 10 seconds.`);

        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new KillCommand();
