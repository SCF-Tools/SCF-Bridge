const InboundMinecraftMessage = require('#shared/Events/InboundMinecraftMessage.js');
const { AttachmentBuilder, EmbedBuilder, escapeMarkdown } = require('discord.js');
const messageToImage = require('#shared/ImageRenderer/messageToImage.js');
const CustomEmbed = require("../modules/CustomEmbed.js");
const parser = require('#shared/ParseHypixelMessage.js');
const heads = require('#shared/GeneratePlayerHead.js');
const Mojang = require("#shared/API/Mojang.js");
const Banlists = require("#shared/API/Banlists.js");
const branding = require('#root/Branding.js');

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
            const cleaned_message = event.payload.message;

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
            } catch (e) {}

            /**
             * Think how to manage methods like
             *
             * guildJoinRequest
             * guildJoin
             *
             * are implemented so that they dont
             * query same APIs twice.
             */

            /**
             * Events related to mutes.
             */

            let guildMute = parser.guildMute(cleaned_message);
            let userMute = parser.userMute(cleaned_message);

            if (guildMute.found || userMute.found) {
                let nick = escapeMarkdown(userMute.parts.nick || 'Guild Chat');
                let staff = escapeMarkdown(guildMute.parts.staff || userMute.parts.staff);
                let duration = guildMute.parts.duration || userMute.parts.duration;

                let embed = new EmbedBuilder();
                embed.setDescription(`${nick} was muted by ${staff} for ${duration}`);
                embed.setColor(branding.color.fail);

                await guild_channel.send({
                    embeds: [embed]
                });
                await events_channel.send({
                    embeds: [embed]
                });
                return;
            }

            let guildUnmute = parser.guildUnmute(cleaned_message);
            let userUnmute = parser.userUnmute(cleaned_message);

            if (guildUnmute.found || userUnmute.found) {
                let nick = escapeMarkdown(userUnmute.parts.nick || 'Guild Chat');
                let staff = escapeMarkdown(guildUnmute.parts.staff || userUnmute.parts.staff);

                let embed = new EmbedBuilder();
                embed.setDescription(`${nick} was unmuted by ${staff}`);
                embed.setColor(branding.color.success);

                await guild_channel.send({
                    embeds: [embed]
                });
                await events_channel.send({
                    embeds: [embed]
                });

                return;
            }

            let alreadyMuted = parser.alreadyMuted(cleaned_message);
            let muteIsTooLong = parser.muteIsTooLong(cleaned_message);

            if (alreadyMuted.found || muteIsTooLong.found) {
                let error_message = `The user was already muted.`;
                if (muteIsTooLong.found) error_message = `You cannot mute someone for more than one month!`;

                let embed = new EmbedBuilder();
                embed.setDescription(error_message);
                embed.setColor(branding.color.fail);

                await events_channel.send({
                    embeds: [embed]
                });

                return;
            }

            /**
             * Events related to ranks.
             */

            let guildPromotion = parser.guildPromotion(cleaned_message);
            let guildDemotion = parser.guildDemotion(cleaned_message);

            if (guildPromotion.found || guildDemotion.found) {
                let nick = escapeMarkdown(guildPromotion.parts.nick || guildDemotion.parts.nick);
                let oldRank = guildPromotion.parts.oldRank || guildDemotion.parts.oldRank;
                let newRank = guildPromotion.parts.newRank || guildDemotion.parts.newRank;
                let embed_color = branding.color.success;
                let action = 'promoted';

                if (guildDemotion.found) {
                    embed_color = branding.color.fail;
                    action = 'demoted';
                }

                let embed = new EmbedBuilder();
                embed.setDescription(`${nick} was ${action} from ${oldRank} to ${newRank}`);
                embed.setColor(embed_color);

                await guild_channel.send({
                    embeds: [embed]
                });
                await events_channel.send({
                    embeds: [embed]
                });
                return;
            }

            let rankNotFound = parser.rankNotFound(cleaned_message);
            let alreadyLowestRank = parser.alreadyLowestRank(cleaned_message);
            let alreadySameRank = parser.alreadySameRank(cleaned_message);

            if (rankNotFound.found || alreadyLowestRank.found || alreadySameRank.found) {
                let error_message = 'An error was encountered.';

                if (rankNotFound.found)
                    error_message = `Rank ${rankNotFound.parts.rank} does not exist.`;
                if (alreadyLowestRank.found)
                    error_message = `${escapeMarkdown(
                        alreadyLowestRank.parts.nick
                    )} already has the lowest rank possible.`;
                if (alreadySameRank.found)
                    error_message = `The player has that rank already.`;

                let embed = new EmbedBuilder();
                embed.setDescription(error_message);
                embed.setColor(branding.color.fail);

                await events_channel.send({
                    embeds: [embed]
                });

                return;
            }

            /**
             * Events related to being in the guild.
             */

            /**
             * TODO: ADD GUILDJOINREQUEST
             */

            let guildJoin = parser.guildJoin(cleaned_message);

            if(guildJoin.found){
                /**
                 * Discord is only responsible for showing the banlist info
                 * in a Discord message, it does nothing feature-wise.
                 * 
                 * It is up for Minecraft side to decide whether to
                 * kick or not.
                 */
                let raw_nick = guildJoin.parts.nick;
                let nick = escapeMarkdown(raw_nick);
                let uuid = (await Mojang.fetchByNick(raw_nick)).uuid;

                let check_embed = new CustomEmbed();
                check_embed.setTitle(`${nick} joined the Guild!`);
                check_embed.setDescription("The player is not flagged in the Banlists.")
                check_embed.setColor(branding.color.success);
                check_embed.setThumbnail(heads.getURL(raw_nick));
                
                let join_embed = new EmbedBuilder();
                join_embed.setAuthor({
                    name: `${raw_nick} joined the Guild!`,
                    iconURL: heads.getURL(raw_nick)
                });
                join_embed.setDescription(`Welcome to the Guild! :heart:`);
                join_embed.setColor(branding.color.success);

                try{
                    if(!uuid){
                        throw "Failed to obtain UUID of the joined player.";
                    }

                    let banlist_info = await Banlists.check(uuid);

                    if(banlist_info.banned){
                        check_embed.setDescription(`The player **is flagged** in a Banlist!\n\nFlagged by: \`${banlist_info.flagged_by}\`\nReason: \`${banlist_info.reason}\``);
                        check_embed.setColor(branding.color.fail);
                    }
                }
                catch(e){
                    check_embed.setDescription(`**Failed to check the Banlists!**\n\`${e.toString()}\``);
                    check_embed.setColor(branding.color.fail);
                }

                await guild_channel.send({
                    embeds: [join_embed]
                });
                
                await events_channel.send({
                    content: `${this.discord.config.ping_role || ""}\n:inbox_tray: ${nick} has joined the guild!`,
                    embeds: [check_embed, join_embed]
                });

                return;
            }

            let guildLeave = parser.guildLeave(cleaned_message);
            let guildKick = parser.guildKick(cleaned_message);

            if (guildLeave.found || guildKick.found) {
                let raw_nick = guildLeave.parts.nick || guildLeave.parts.nick;
                let nick = escapeMarkdown(raw_nick);

                let action = "left";
                if (guildKick.found) {
                    action = "was kicked from";
                }

                let embed = new EmbedBuilder();

                embed.setAuthor({
                    name: `${nick} ${action} the Guild!`,
                    iconURL: heads.getURL(raw_nick)
                });
                embed.setDescription(`We hope to see you again! :pray:`);
                embed.setColor(branding.color.fail);

                await guild_channel.send({
                    embeds: [embed]
                });
                
                await events_channel.send({
                    content: `${this.discord.config.ping_role || ""}\n:outbox_tray: ${nick} has left the guild!`,
                    embeds: [embed]
                });

                return;
            }

            let onlineInvite = parser.onlineInvite(cleaned_message);
            let offlineInvite = parser.offlineInvite(cleaned_message);

            if (onlineInvite.found || offlineInvite.found) {
                let nick = escapeMarkdown(onlineInvite.parts.nick || offlineInvite.parts.nick);

                let description = `${nick} was invited to the guild!`;
                if (offlineInvite.found) {
                    description = `${nick} was offline-invited to the guild!`;
                }

                let embed = new EmbedBuilder();
                embed.setDescription(description);
                embed.setColor(branding.color.success);

                await events_channel.send({
                    embeds: [embed]
                });

                return;
            }

            let inviteError = parser.inviteError(cleaned_message);

            if (inviteError.found) {
                let error_message = `Failed to invite a player to the guild!`;

                let embed = new EmbedBuilder();
                embed.setDescription(error_message);
                embed.setColor(branding.color.fail);

                await events_channel.send({
                    embeds: [embed]
                });

                return;
            }

            /**
             * Events related to usual guild events.
             */

            let playerLogin = parser.playerLogin(cleaned_message);
            let playerLogout = parser.playerLogout(cleaned_message);

            if (playerLogin.found || playerLogout.found) {
                let nick = playerLogin.parts.nick || playerLogout.parts.nick;
                let embed_color = branding.color.success;
                let action = 'joined';

                if (playerLogout.found) {
                    embed_color = branding.color.fail;
                    action = 'left';
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

            let questCompletion = parser.questCompletion(cleaned_message);
            if (questCompletion.found) {
                let tier = questCompletion.parts.tier;

                let description = `Guild Quest tier ${tier} completed!`;

                let embed = new EmbedBuilder();
                embed.setTitle(`Guild Quest Completed!`);
                embed.setDescription(description);
                embed.setColor(0xffd700);

                await guild_channel.send({
                    embeds: [embed]
                });

                await events_channel.send({
                    embeds: [embed]
                });

                return;
            }

            let levelUp = parser.levelUp(cleaned_message);
            if (levelUp.found) {
                let level = levelUp.parts.level;

                let description = `The Guild has reached Level ${level}!`;

                let embed = new EmbedBuilder();
                embed.setTitle(`Guild Level Up`);
                embed.setDescription(description);
                embed.setColor(0xffd700);

                await guild_channel.send({
                    embeds: [embed]
                });

                await events_channel.send({
                    embeds: [embed]
                });

                return;
            }

            /**
             * Error Events
             */

            let repeatMessage = parser.repeatMessage(cleaned_message);
            
            if(repeatMessage.found){
                let error_message = `Bot cannot say the same message twice!`;
                let embed = new EmbedBuilder();
                embed.setDescription(error_message);
                embed.setColor(branding.color.fail);

                await guild_channel.send({
                    embeds: [embed]
                });

                return;
            }

            let noPermission = parser.noPermission(cleaned_message);
            let incorrectUsage = parser.incorrectUsage(cleaned_message);

            if (noPermission.found || incorrectUsage.found) {
                let error_message = 'An error was encountered.';

                if (noPermission.found) error_message = `Bot is missing permission to run the command.`;
                if (incorrectUsage.found) error_message = `The command was used incorrectly.`;

                let embed = new EmbedBuilder();
                embed.setDescription(error_message);
                embed.setColor(branding.color.fail);

                await events_channel.send({
                    embeds: [embed]
                });

                return;
            }

            let playerNotFound = parser.playerNotFound(cleaned_message);
            let notInGuild = parser.notInGuild(cleaned_message);

            if (playerNotFound.found || notInGuild.found) {
                let nick = escapeMarkdown(playerNotFound.parts.nick || notInGuild.parts.nick);
                let error_message = `Player ${nick} not found!`;

                if (notInGuild.found) error_message = `${nick} is not in this guild!`;

                let embed = new EmbedBuilder();
                embed.setDescription(error_message);
                embed.setColor(branding.color.fail);

                await events_channel.send({
                    embeds: [embed]
                });

                return;
            }
        }
    }
}

module.exports = ExternalEventManager;
