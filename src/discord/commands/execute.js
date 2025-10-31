const MinecraftRawEvent = require('#root/shared/Events/MinecraftRawEvent.js');
const DiscordCommand = require('../modules/DiscordCommand.js');
const UserError = require('../modules/UserError.js');
const CustomEmbed = require('../modules/CustomEmbed.js');
const Permissions = require('../modules/PermissionManager.js');

class ExecuteCommand extends DiscordCommand {
    name = 'execute';
    description = 'Runs a command in Minecraft as the bot.';
    options = [
        {
            name: 'command',
            description: 'The command to run',
            type: 3,
            required: true
        }
    ];

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        Permissions.canExecute(interaction.member, Permissions.tiers.ADMINISTRATOR);

        let command = interaction.options.getString('command');
        if (!command) {
            throw new UserError('The command cannot be empty.');
        }

        if (!command.startsWith('/')) {
            command = '/' + command;
        }

        let event = new MinecraftRawEvent(this.approach.id, command);
        this.approach.emitEvent(event);

        let response = new CustomEmbed()
            .setColor(0x008000)
            .setTitle('Command Executed')
            .setDescription(`The command \`${command}\` has been executed.`);

        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new ExecuteCommand();
