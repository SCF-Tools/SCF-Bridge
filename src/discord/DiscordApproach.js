const Approach = require("#shared/Approaches/Approach.js");
const ChannelHandler = require("./modules/ChannelHandler.js");
const logger = require("#src/Logger.js");
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const safeDiscord = require("./modules/SafeDiscord.js");

class DiscordApproach extends Approach {
    /** 
     * @typedef {Object} DiscordChannels
     * @property {?string} guild
     * @property {?string} officer
     * @property {?string} events
     * @property {?string} console
     * 
     * @typedef {Object} DiscordConfig
     * @property {?string} approach_id
     * @property {?string} token
     * @property {?string} server
     * @property {DiscordChannels} channels
     */

    /**
     * @type {DiscordConfig}
     */
    config = {};
    enabled = false;
    /**
     * @type {Client}
     */
    client;

    /**
     * @type {ChannelHandler}
     */
    channels;

    constructor(approach_id, config) {
        super("discord");

        if (config.token) this.enabled = true;

        this.config.approach_id = approach_id;
        this.config.token = config.token;
        this.config.server = config.server;

        this.config.channels = {
            guild: config?.channels?.guild,
            officer: config?.channels?.officer,
            events: config?.channels?.events,
            console: config?.channels?.console,
        };

        this.channels = new ChannelHandler(this);
    }

    init() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.enabled = false;
                reject(`Failed to setup the ${this.config.approach_id} approach in 60 seconds.`);
            }, 60_000);

            this.client = new Client({
                intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
            });

            this.client.login(this.config.token).catch((error) => {
                this.enabled = false;
                logger.error(`Failed to log into Discord at ${this.config.approach_id}.`, error);
            });

            this.client.on('clientReady', () => {
                resolve();

                clearTimeout(timeout);
                logger.success(`Successfully setup "${this.config.approach_id}" approach, with client "${this.client.user.tag}"!`);
                this.startOperation();
            });

            process.on('SIGINT', async () => {
                process.kill(process.pid, 'SIGTERM');
            });
        });
    }

    async startOperation() {
        try {
            this.client.user.setPresence({
                activities: [{
                    name: `your guild bridge!`,
                    type: ActivityType.Watching
                }]
            });

            let guild_channel = this.channels.get("guild");
            if (guild_channel) {
                await safeDiscord.send(guild_channel, {
                    embeds: [
                        {
                            title: "The bridge is online!",
                            color: 0x008000
                        }
                    ]
                });
            }
            else logger.error(`Channel "guild" not found on ${this.config.approach_id}!`);

            await this.registerMessageHandler();
        }
        catch (e) {
            logger.error(`Failed to bring the approach ${this.config.approach_id} to normal operation.`, e);
            this.enabled = false;
        }
    }

    async registerMessageHandler(){
        this.client.on('messageCreate', (message) => {
            if(!Object.values(this.config.channels).includes(message.channel.id)){
                // We are not listening to these channels.
                return;
            }

            // TODO: Add handling for messages.
        });
    }

    async registerCommandHandler(){

    }
}

module.exports = DiscordApproach;