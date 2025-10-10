const Approach = require("#shared/Approaches/Approach.js");
const logger = require("#src/Logger.js");
const { Client, GatewayIntentBits } = require("discord.js");

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

    constructor(approach_id, config) {
        super("discord");

        if (config.token) this.enabled = true;

        this.config.approach_id = approach_id;
        this.config.token = config.token;
        this.config.server = config.server;

        this.config.channels = {
            guild: config.channels.guild,
            officer: config.channels.officer,
            events: config.channels.events,
            console: config.channels.console,
        };
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
                clearTimeout(timeout);
                logger.success(`Successfully setup "${this.config.approach_id}" approach, with client "${this.client.user.tag}"!`);
                resolve();
            });

            process.on('SIGINT', async () => {
                process.kill(process.pid, 'SIGTERM');
            });
        });
    }
}

module.exports = DiscordApproach;