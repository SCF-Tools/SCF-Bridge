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
            } catch (e) { /* ignore */ }

            /**
             * Think how to manage methods like
             *
             * guildJoinRequest
             *
             * are implemented so that they dont
             * query same APIs twice.
             */

            /**
             * Events related to mutes.
             */

            const guildMute = parser.guildMute(cleaned_message);
            const userMute = parser.userMute(cleaned_message);

            if (guildMute.found || userMute.found) {
                const nick = escapeMarkdown(userMute.parts.nick || 'Guild Chat');
                const staff = escapeMarkdown(guildMute.parts.staff || userMute.parts.staff);
                const duration = guildMute.parts.duration || userMute.parts.duration;

                const embed = new EmbedBuilder();
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

            const guildUnmute = parser.guildUnmute(cleaned_message);
            const userUnmute = parser.userUnmute(cleaned_message);

            if (guildUnmute.found || userUnmute.found) {
                const nick = escapeMarkdown(userUnmute.parts.nick || 'Guild Chat');
                const staff = escapeMarkdown(guildUnmute.parts.staff || userUnmute.parts.staff);

                const embed = new EmbedBuilder();
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

            const alreadyMuted = parser.alreadyMuted(cleaned_message);
            const muteIsTooLong = parser.muteIsTooLong(cleaned_message);

            if (alreadyMuted.found || muteIsTooLong.found) {
                let error_message = `The user was already muted.`;
                if (muteIsTooLong.found) error_message = `You cannot mute someone for more than one month!`;

                const embed = new EmbedBuilder();
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

            const guildPromotion = parser.guildPromotion(cleaned_message);
            const guildDemotion = parser.guildDemotion(cleaned_message);

            if (guildPromotion.found || guildDemotion.found) {
                const nick = escapeMarkdown(guildPromotion.parts.nick || guildDemotion.parts.nick);
                const oldRank = guildPromotion.parts.oldRank || guildDemotion.parts.oldRank;
                const newRank = guildPromotion.parts.newRank || guildDemotion.parts.newRank;
                let embed_color = branding.color.success;
                let action = 'promoted';

                if (guildDemotion.found) {
                    embed_color = branding.color.fail;
                    action = 'demoted';
                }

                const embed = new EmbedBuilder();
                embed.setDescription(`${nick} was ${action} from ${escapeMarkdown(oldRank)} to ${escapeMarkdown(newRank)}`);
                embed.setColor(embed_color);

                await guild_channel.send({
                    embeds: [embed]
                });
                await events_channel.send({
                    embeds: [embed]
                });
                return;
            }

            const rankNotFound = parser.rankNotFound(cleaned_message);
            const alreadyLowestRank = parser.alreadyLowestRank(cleaned_message);
            const alreadySameRank = parser.alreadySameRank(cleaned_message);

            if (rankNotFound.found || alreadyLowestRank.found || alreadySameRank.found) {
                let error_message = 'An error was encountered.';

                if (rankNotFound.found)
                {error_message = `Rank ${escapeMarkdown(rankNotFound.parts.rank)} does not exist.`;}
                if (alreadyLowestRank.found)
                {error_message = `${escapeMarkdown(
                    alreadyLowestRank.parts.nick
                )} already has the lowest rank possible.`;}
                if (alreadySameRank.found)
                {error_message = `The player has that rank already.`;}

                const embed = new EmbedBuilder();
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

            const guildJoin = parser.guildJoin(cleaned_message);

            if(guildJoin.found){
                /**
                 * Discord is only responsible for showing the banlist info
                 * in a Discord message, it does nothing feature-wise.
                 * 
                 * It is up for Minecraft side to decide whether to
                 * kick or not.
                 */
                const raw_nick = guildJoin.parts.nick;
                const nick = escapeMarkdown(raw_nick);
                const uuid = (await Mojang.fetchByNick(raw_nick)).uuid;

                const check_embed = new CustomEmbed();
                check_embed.setTitle(`${nick} joined the Guild!`);
                check_embed.setDescription("The player is not flagged in the Banlists.")
                check_embed.setColor(branding.color.success);
                check_embed.setThumbnail(heads.getURL(raw_nick));
                
                const join_embed = new EmbedBuilder();
                join_embed.setAuthor({
                    name: `${raw_nick} joined the Guild!`,
                    iconURL: heads.getURL(raw_nick)
                });
                join_embed.setDescription(`Welcome to the Guild! :heart:`);
                join_embed.setColor(branding.color.success);

                try{
                    if(!uuid){
                        throw new Error("Failed to obtain UUID of the joined player.");
                    }

                    const banlist_info = await Banlists.check(uuid);

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

            const guildLeave = parser.guildLeave(cleaned_message);
            const guildKick = parser.guildKick(cleaned_message);

            if (guildLeave.found || guildKick.found) {
                const raw_nick = guildLeave.parts.nick || guildKick.parts.nick;
                const nick = escapeMarkdown(raw_nick);

                let action = "left";
                if (guildKick.found) {
                    action = "was kicked from";
                }

                const embed = new EmbedBuilder();

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
                    content: `${this.discord.config.ping_role || ""}\n:outbox_tray: ${nick} ${action} the guild!`,
                    embeds: [embed]
                });

                return;
            }

            const onlineInvite = parser.onlineInvite(cleaned_message);
            const offlineInvite = parser.offlineInvite(cleaned_message);

            if (onlineInvite.found || offlineInvite.found) {
                const nick = escapeMarkdown(onlineInvite.parts.nick || offlineInvite.parts.nick);

                let description = `${nick} was invited to the guild!`;
                if (offlineInvite.found) {
                    description = `${nick} was offline-invited to the guild!`;
                }

                const embed = new EmbedBuilder();
                embed.setDescription(description);
                embed.setColor(branding.color.success);

                await events_channel.send({
                    embeds: [embed]
                });

                return;
            }

            const inviteError = parser.inviteError(cleaned_message);

            if (inviteError.found) {
                const error_message = `Failed to invite a player to the guild!`;

                const embed = new EmbedBuilder();
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

            const playerLogin = parser.playerLogin(cleaned_message);
            const playerLogout = parser.playerLogout(cleaned_message);

            if (playerLogin.found || playerLogout.found) {
                const nick = playerLogin.parts.nick || playerLogout.parts.nick;
                let embed_color = branding.color.success;
                let action = 'joined';

                if (playerLogout.found) {
                    embed_color = branding.color.fail;
                    action = 'left';
                }

                const embed = new EmbedBuilder();
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

            const questCompletion = parser.questCompletion(cleaned_message);
            if (questCompletion.found) {
                const tier = questCompletion.parts.tier;

                const description = `Guild Quest tier ${tier} completed!`;

                const embed = new EmbedBuilder();
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

            const levelUp = parser.levelUp(cleaned_message);
            if (levelUp.found) {
                const level = levelUp.parts.level;

                const description = `The Guild has reached Level ${level}!`;

                const embed = new EmbedBuilder();
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

            const repeatMessage = parser.repeatMessage(cleaned_message);
            
            if(repeatMessage.found){
                const error_message = `Bot cannot say the same message twice!`;
                const embed = new EmbedBuilder();
                embed.setDescription(error_message);
                embed.setColor(branding.color.fail);

                await guild_channel.send({
                    embeds: [embed]
                });

                return;
            }

            const noPermission = parser.noPermission(cleaned_message);
            const incorrectUsage = parser.incorrectUsage(cleaned_message);

            if (noPermission.found || incorrectUsage.found) {
                let error_message = 'An error was encountered.';

                if (noPermission.found) error_message = `Bot is missing permission to run the command.`;
                if (incorrectUsage.found) error_message = `The command was used incorrectly.`;

                const embed = new EmbedBuilder();
                embed.setDescription(error_message);
                embed.setColor(branding.color.fail);

                await events_channel.send({
                    embeds: [embed]
                });

                return;
            }

            const playerNotFound = parser.playerNotFound(cleaned_message);
            const notInGuild = parser.notInGuild(cleaned_message);

            if (playerNotFound.found || notInGuild.found) {
                const nick = escapeMarkdown(playerNotFound.parts.nick || notInGuild.parts.nick);
                let error_message = `Player ${nick} not found!`;

                if (notInGuild.found) error_message = `${nick} is not in this guild!`;

                const embed = new EmbedBuilder();
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
