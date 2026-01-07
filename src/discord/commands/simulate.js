const InboundMinecraftMessage = require('#shared/Events/InboundMinecraftMessage.js');
const DiscordCommand = require('../modules/DiscordCommand.js');
const UserError = require('../modules/UserError.js');
const CustomEmbed = require('../modules/CustomEmbed.js');
const Permissions = require('../modules/PermissionManager.js');
const branding = require("#root/Branding.js");

class SimulateCommand extends DiscordCommand {
    name = 'simulate';
    description = 'Simulates the inbound Minecraft message.';
    options = [
        {
            name: 'message',
            description: 'The message to simulate.',
            type: 3,
            required: true
        }
    ];

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        Permissions.canExecute(interaction.member, Permissions.tiers.OWNER);

        let message = interaction.options.getString('message');
        if (!message) {
            throw new UserError('The message cannot be empty.');
        }

        let event = new InboundMinecraftMessage("external_approach", message, message);
        this.approach.emitEvent(event);

        let response = new CustomEmbed()
            .setColor(branding.color.success)
            .setTitle('Message Simulated')
            .setDescription(`The message was successfully injected.`);

        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new SimulateCommand();
