const OutboundMinecraftMessage = require('#root/shared/Events/OutboundMinecraftMessage.js');
const DiscordCommand = require('../modules/DiscordCommand.js');
const UserError = require('../modules/UserError.js');
const CustomEmbed = require('../modules/CustomEmbed.js');
const Permissions = require('../modules/PermissionManager.js');

class KickCommand extends DiscordCommand {
    name = 'kick';
    description = 'Kicks player from the guild.';
    options = [
        {
            name: 'nick',
            description: 'The user to kick',
            type: 3,
            required: true
        },
        {
            name: 'reason',
            description: 'The reason for the kick',
            type: 3,
            required: false
        }
    ];

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        Permissions.canExecute(interaction.member, Permissions.tiers.MODERATOR);

        let nick = interaction.options.getString('nick');
        let reason =
            interaction.options.getString('reason') || 'You can rejoin the guild by using the /g join command.';
        if (!nick) {
            throw new UserError('The nick cannot be empty.');
        }

        let command = `/g kick ${nick} ${reason}`;

        let event = new OutboundMinecraftMessage(this.approach.id, command);
        this.approach.emitEvent(event);

        let response = new CustomEmbed()
            .setColor(0x008000)
            .setTitle('Guild Kick')
            .setDescription(`The command to kick \`${nick}\` was sent.`);

        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new KickCommand();
