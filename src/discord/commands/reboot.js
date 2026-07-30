const DiscordCommand = require('../modules/DiscordCommand.js');
const CustomEmbed = require('../modules/CustomEmbed.js');
const Permissions = require('../modules/PermissionManager.js');
const branding = require('#root/Branding.js');

class RebootCommand extends DiscordCommand {
    name = 'reboot';
    description = 'Restarts the bridge\'s worker process.';
    options = [];

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        Permissions.canExecute(interaction.member, Permissions.tiers.ADMINISTRATOR);

        setTimeout(() => {
            process.exit(0);
        }, 10_000);

        const response = new CustomEmbed()
            .setColor(branding.color.success)
            .setTitle('Bridge Reboot')
            .setDescription(`The bridge will restart in 10 seconds.`);

        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new RebootCommand();
