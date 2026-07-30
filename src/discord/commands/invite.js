const OutboundMinecraftMessage = require('#shared/Events/OutboundMinecraftMessage.js');
const DiscordCommand = require('../modules/DiscordCommand.js');
const UserError = require('../modules/UserError.js');
const CustomEmbed = require('../modules/CustomEmbed.js');
const Permissions = require('../modules/PermissionManager.js');
const branding = require("#root/Branding.js");

class InviteCommand extends DiscordCommand {
    name = 'invite';
    description = 'Invites player to the guild.';
    options = [
        {
            name: 'nick',
            description: 'The user to invite',
            type: 3,
            required: true
        }
    ];

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        Permissions.canExecute(interaction.member, Permissions.tiers.MODERATOR);

        const nick = interaction.options.getString('nick');
        if (!nick) {
            throw new UserError('The nick cannot be empty.');
        }

        const command = `/g invite ${nick}`;

        const event = new OutboundMinecraftMessage(this.approach.id, command);
        this.approach.emitEvent(event);

        const response = new CustomEmbed()
            .setColor(branding.color.success)
            .setTitle('Guild Invite')
            .setDescription(`The command to invite \`${nick}\` was sent.`);

        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new InviteCommand();
