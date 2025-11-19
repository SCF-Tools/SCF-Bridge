const OutboundMinecraftMessage = require('#shared/Events/OutboundMinecraftMessage.js');
const DiscordCommand = require('../modules/DiscordCommand.js');
const UserError = require('../modules/UserError.js');
const CustomEmbed = require('../modules/CustomEmbed.js');
const Permissions = require('../modules/PermissionManager.js');

class DemoteCommand extends DiscordCommand {
    name = 'demote';
    description = 'Demote the player in the guild.';
    options = [
        {
            name: 'nick',
            description: 'The user to demote',
            type: 3,
            required: true
        }
    ];

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        Permissions.canExecute(interaction.member, Permissions.tiers.ADMINISTRATOR);

        let nick = interaction.options.getString('nick');
        if (!nick) {
            throw new UserError('The nick cannot be empty.');
        }

        let command = `/g demote ${nick}`;

        let event = new OutboundMinecraftMessage(this.approach.id, command);
        this.approach.emitEvent(event);

        let response = new CustomEmbed()
            .setColor(0x008000)
            .setTitle('Guild Demotion')
            .setDescription(`The command to demote \`${nick}\` was sent.`);

        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new DemoteCommand();
