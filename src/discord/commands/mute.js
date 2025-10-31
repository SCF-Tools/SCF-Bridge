const MinecraftRawEvent = require('#root/shared/Events/MinecraftRawEvent.js');
const DiscordCommand = require('../modules/DiscordCommand.js');
const UserError = require('../modules/UserError.js');
const CustomEmbed = require('../modules/CustomEmbed.js');
const Permissions = require('../modules/PermissionManager.js');

class MuteCommand extends DiscordCommand {
    name = 'mute';
    description = 'Issues a mute to the player in the guild.';
    options = [
        {
            name: 'nick',
            description: 'The user to mute',
            type: 3,
            required: true
        },
        {
            name: 'duration',
            description: 'The duration of the mute',
            type: 3,
            required: true
        }
    ];

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        Permissions.canExecute(interaction.member, Permissions.tiers.MODERATOR);

        let nick = interaction.options.getString('nick');
        let duration = interaction.options.getString('duration');
        if (!nick) {
            throw new UserError('The nick cannot be empty.');
        }

        let command = `/g mute ${nick} ${duration}`;

        let event = new MinecraftRawEvent(this.approach.id, command);
        this.approach.emitEvent(event);

        let response = new CustomEmbed()
            .setColor(0x008000)
            .setTitle('Guild Mute')
            .setDescription(`The command to mute \`${nick}\` was sent.`);

        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new MuteCommand();
