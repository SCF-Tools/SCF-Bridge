const InboundMinecraftMessage = require('#shared/Events/InboundMinecraftMessage.js');
const { AttachmentBuilder, EmbedBuilder, escapeMarkdown } = require('discord.js');
const messageToImage = require('#shared/ImageRenderer/messageToImage.js');
const parser = require('#shared/ParseHypixelMessage.js');
const heads = require('#shared/GeneratePlayerHead.js');
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
             * ----------------------------------------
             * To do:
             *
             * guildLeave
             * guildKick
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

            let guildLeave = parser.guildLeave(cleaned_message);
            let guildKick = parser.guildKick(cleaned_message);

            if (guildLeave.found || guildKick.found) {
                let nick = escapeMarkdown(guildLeave.parts.nick || guildLeave.parts.nick);

                let action = "Left";
                let description = `${nick} left the Guild!`;

                if (guildKick.found) {
                    action = "Kicked";
                    description = `${nick} was kicked from the Guild!!`;
                }

                let embed = new EmbedBuilder();
                embed.setTitle(`Member ${action}`)
                embed.setDescription(description);
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
             * Information Events
             * Events that have to be shown to some people.
             */

            let playerLogin = parser.playerLogin(cleaned_message);
            let playerLogout = parser.playerLogout(cleaned_message);

            if (playerLogin.found || playerLogout.found) {
                let nick = escapeMarkdown(playerLogin.parts.nick || playerLogout.parts.nick);
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
             * Events that only appear in logs.
             */

            let noPermission = parser.noPermission(cleaned_message);
            let incorrectUsage = parser.incorrectUsage(cleaned_message);

            // Small errors that have no parts.
            if (noPermission.found || incorrectUsage.found) {
                let error_message = 'An error was encountered.';

                if (inviteError.found) error_message = `Failed to invite a player to the guild!`;
                if (noPermission.found) error_message = `Bot is missing permission to run the command.`;
                if (incorrectUsage.found) error_message = `The command was used incorrectly.`;
                if (alreadyMuted.found) error_message = `The user was already muted.`;
                if (muteIsTooLong.found) error_message = `You cannot mute someone for more than one month!`;

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
