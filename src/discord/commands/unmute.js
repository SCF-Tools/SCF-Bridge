const MinecraftRawEvent = require("#root/shared/Events/MinecraftRawEvent.js");
const DiscordCommand = require("../modules/DiscordCommand.js");
const UserError = require("../modules/UserError.js");
const CustomEmbed = require("../modules/CustomEmbed.js");
const Permissions = require("../modules/PermissionManager.js");

class UnmuteCommand extends DiscordCommand {
    name = "unmute";
    description = "Removes a mute from the player in the guild.";
    options = [
        {
            name: 'nick',
            description: 'The user to unmute',
            type: 3,
            required: true
        }
    ];

    /**
     * @param {import("discord.js").CommandInteraction} interaction 
     */
    async execute(interaction){
        Permissions.canExecute(interaction.member, Permissions.tiers.MODERATOR);

        let nick = interaction.options.getString('nick');
        if (!nick) {
            throw new UserError("The nick cannot be empty.");
        }

        let command = `/g unmute ${nick}`;

        let event = new MinecraftRawEvent(this.approach.id, command);
        this.approach.emitEvent(event);

        let response = new CustomEmbed()
            .setColor(0x008000)
            .setTitle("Guild Unmute")
            .setDescription(`The command to unmute \`${nick}\` was sent.`)
            
        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new UnmuteCommand();