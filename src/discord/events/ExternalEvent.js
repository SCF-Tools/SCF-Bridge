const InboundMinecraftMessage = require('#shared/Events/InboundMinecraftMessage.js');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const messageToImage = require('#shared/ImageRenderer/messageToImage.js');
const parser = require("#shared/ParseHypixelMessage.js");
const heads = require("#shared/GeneratePlayerHead.js");

class ExternalEventManager {
    /**
     * @type {import("../DiscordApproach")}
     */
    discord;

    constructor(discord_instance) {
        this.discord = discord_instance;
    }

    /**
     * @param {import("#shared/Events/GenericEvent.js")} event
     */
    async handle(event) {
        if (event instanceof InboundMinecraftMessage) {
            const color = {
                success: 0x1F8B4C,
                fail: 0xED4245
            };

            const console_channel = this.discord.channels.get('console');
            const events_channel = this.discord.channels.get('events');
            const officer_channel = this.discord.channels.get('officer');
            const guild_channel = this.discord.channels.get('guild');

            try {
                await console_channel.send({
                    files: [
                        new AttachmentBuilder(await messageToImage(event.payload.colored), {
                            name: `message.png`
                        })
                    ]
                });
            }
            catch (e) { }

            /**
             * Think how to manage methods like
             * 
             * guildJoinRequest
             * guildJoin
             * 
             * are implemented so that they dont 
             * query same APIs twice.
             * ----------------------------------------
             * To do:
             * 
             * guildLeave
             * guildKick
             */


            let playerJoin = parser.playerLogin(event.payload.message);
            let playerLeave = parser.playerLogout(event.payload.message);

            if(playerJoin.found || playerLeave.found){
                let nick = playerJoin.parts.nick || playerLeave.parts.nick;
                let embed_color = color.success;
                let action = "joined";

                if(playerLeave.found){
                    embed_color = color.fail;
                    action = "left";
                }

                let embed = new EmbedBuilder();
                embed.setAuthor({
                    name: `${nick} ${action}`,
                    iconURL: heads.getURL(nick)
                });
                embed.setColor(embed_color);

                await guild_channel.send({
                    embeds: [embed]
                });
                return;
            }

            let guildPromotion = parser.guildPromotion(event.payload.message);
            let guildDemotion = parser.guildDemotion(event.payload.message);
            
            if (guildPromotion.found || guildDemotion.found) {
                let nick = guildPromotion.parts.nick || guildDemotion.parts.nick;
                let oldRank = guildPromotion.parts.oldRank || guildDemotion.parts.oldRank;
                let newRank = guildPromotion.parts.newRank || guildDemotion.parts.newRank;
                let embed_color = color.success;
                let action = "promoted";

                if(guildDemotion.found){
                    embed_color = color.fail;
                    action = "demoted";
                }

                let embed = new EmbedBuilder();
                embed.setDescription(
                    `${nick} was ${action} from ${oldRank} to ${newRank}`
                )
                embed.setColor(embed_color);

                await guild_channel.send({
                    embeds: [embed]
                });
                await events_channel.send({
                    embeds: [embed]
                })
            }
        }
    }
}

module.exports = ExternalEventManager;
