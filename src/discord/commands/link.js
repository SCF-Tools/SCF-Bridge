const DiscordCommand = require('../modules/DiscordCommand.js');
const UserError = require('../modules/UserError.js');
const CustomEmbed = require('../modules/CustomEmbed.js');
const branding = require('#root/Branding.js');
const Mojang = require('#shared/API/Mojang.js');
const config = require('#root/Config.js').get();

class LinkCommand extends DiscordCommand {
    name = 'link';
    description = 'Links the Discord account with Minecraft profile.';
    options = [
        {
            name: 'nick',
            description: 'Minecraft IGN',
            type: 3,
            required: true
        }
    ];

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        let nick = interaction.options.getString('nick');
        if (!nick) {
            throw new UserError('The nick cannot be empty.');
        }

        let minecraft_profile = await Mojang.fetchByNick(nick);
        if (!minecraft_profile.uuid) {
            throw new UserError('The player with this nick does not exist!');
        }

        let guild_info = await Hypixel.fetch(`https://api.hypixel.net/v2/player?uuid=${minecraft_profile.uuid}`);
        let discord_tag = guild_info?.player?.socialMedia?.links?.DISCORD;

        if(discord_tag.toLowerCase() != interaction.user.tag.toLowerCase()){
            throw new UserError(`Your linked Discord account on Hypixel is different from this one!\n\nTag on Hypixel: ${discord_tag}\nDiscord Tag: ${interaction.user.tag}`);
        }

        await config.SCF.API.bridge.link(interaction.user.id, minecraft_profile.uuid);

        let response = new CustomEmbed()
            .setColor(branding.color.success)
            .setTitle('Bridge Link')
            .setDescription(`You will now send messages as \`${minecraft_profile.nick}\`!`);

        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new LinkCommand();
