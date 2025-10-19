const cache = require("#shared/CacheManager.js");
const config = require("#root/Config.js").get();
const Mojang = require("#shared/API/Mojang.js");
const Hypixel = require("#shared/API/Hypixel.js");

const MinecraftRawEvent = require("#shared/Events/MinecraftRawEvent.js");
const MessageGuildEvent = require("#shared/Events/MessageGuildEvent.js");
const MessageOfficerEvent = require("#shared/Events/MessageOfficerEvent.js");

const Permissions = require("../modules/PermissionManager.js");

class MessageManager {
    /**
     * @type {import("../DiscordApproach")}
     */
    discord;

    constructor(discord_instance) {
        this.discord = discord_instance;
    }

    /**
     * 
     * @param {import("discord.js").GuildMember} member 
     */
    async screenPlayer(member) {
        let player_info = {
            display_name: member.nickname,
            user: {
                uuid: null,
                guild_id: null,
            },
            issues: {
                not_linked: false,
                bridgelocked: false,
            },
        };

        if (member.user.bot) {
            return player_info;
        }

        async function SCFCheck() {
            if (!config.SCF) {
                return;
            }

            let link_uuid = await cache.fetch(`scf-bridge-link-${member.id}`, 60_000, async () => {
                return (await config.SCF.API.bridge.getLinked(null, member.id)).uuid;
            });
            if (!link_uuid) {
                player_info.issues.not_linked = true;
                return;
            }

            let bridgelocked = await cache.fetch(`scf-bridge-lock-${link_uuid}`, 15_000, async () => {
                return (await config.SCF.API.bridgelock.check(link_uuid)).locked;
            });
            player_info.issues.bridgelocked = bridgelocked;

            let mojang_account = await Mojang.fetchByUUID(link_uuid);
            if (!mojang_account.uuid) {
                player_info.issues.not_linked = true;
                return;
            }

            player_info.display_name = mojang_account.nick;
            player_info.user.uuid = link_uuid;
        }

        await SCFCheck();

        if (player_info.user.uuid) {
            try {
                let guild_info = await Hypixel.fetch(`https://api.hypixel.net/v2/guild?player=${player_info.user.uuid}`);

                player_info.user.guild_id = guild_info?.guild?._id;
            }
            catch (e) { }
        }

        return player_info;
    }

    /**
     * @param {import("discord.js").Message} message 
     */
    async handle(message) {
        try {
            if (!Object.values(this.discord.config.channels).includes(message.channel.id)) {
                return; // We are not listening to these channels.
            }

            if (message.author.id == this.discord.client.user.id) {
                return; // We are not listening to ourselves.
            }

            if (message.author.bot && !config.allowed_bots.includes(message.author.id)) {
                return; // We are not listening to bot messages.
            }

            let playerInfo = await this.screenPlayer(message.member);
            if (playerInfo.issues.not_linked) {
                await message.reply({
                    embeds: [
                        {
                            color: 0x800000,
                            description: `In order to use the bridge, please link your account using the \`/${this.discord.config.prefix}link\` command.\nIt is required to match your Discord account to your Hypixel account.`
                        }
                    ]
                });
                return;
            }

            if (playerInfo.issues.bridgelocked) {
                await message.react('❌').catch((e) => { });
                return;
            }

            let cleaned_message = message.content;

            // Debug Messages
            if (message.channel.id === this.discord.config.channels.console) {
                let can_execute = Permissions.canExecute(message.member, Permissions.tiers.COUNCIL, true);
                if (!can_execute) {
                    message.react("❌");
                    return;
                }

                let event = new MinecraftRawEvent(this.discord.id, message.content);
                this.discord.emitEvent(event);
                return;
            }

            if (message.channel.id === this.discord.config.channels.officer) {
                let can_execute = Permissions.canExecute(message.member, Permissions.tiers.COUNCIL, true);
                if (!can_execute) {
                    message.react("❌");
                    return;
                }

                let event = new MessageOfficerEvent(this.discord.id, {
                    display_name: playerInfo.display_name,
                    uuid: playerInfo.user.uuid,
                    guild_id: playerInfo.user.guild_id
                }, message.content);
                this.discord.emitEvent(event);
                return;
            }

            if (message.channel.id === this.discord.config.channels.guild) {
                let event = new MessageGuildEvent(this.discord.id, {
                    display_name: playerInfo.display_name,
                    uuid: playerInfo.user.uuid,
                    guild_id: playerInfo.user.guild_id
                }, message.content);
                this.discord.emitEvent(event);
                return;
            }
        }
        catch (e) {
            await message.react("❗").catch(e => { });
            console.log(e);
        }
    }
}

module.exports = MessageManager;