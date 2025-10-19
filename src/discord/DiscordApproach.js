const Approach = require("#shared/Approaches/Approach.js");
const UserError = require("./modules/UserError.js");
const logger = require("#src/Logger.js");
const { Client, GatewayIntentBits, ActivityType, Collection, EmbedBuilder } = require("discord.js");
const safeDiscord = require("./modules/SafeDiscord.js");
const fs = require('fs');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');

const MessageManager = require("./events/Message.js");
const InteractionManager = require("./events/Interaction.js");
const ChannelHandler = require("./modules/ChannelHandler.js");
const ExternalEventManager = require("./events/ExternalEvent.js");

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
     * @property {?string} prefix
     * @property {DiscordChannels} channels
     */

    /**
     * @type {DiscordConfig}
     */
    config = {};
    /**
     * @type {Client}
     */
    client;

    /**
     * @type {ChannelHandler}
     */
    channels;
    /**
     * @type {MessageManager} 
     */
    messageManager;
    /**
     * @type {InteractionManager} 
     */
    interactionManager;
    /**
     * @type {ExternalEventManager}
     */
    externalEventManager;
    /**
     * @type {Collection} 
     */
    commands;

    constructor(approach_id, config) {
        super("discord", approach_id);

        this.config.approach_id = approach_id;
        this.config.token = config.token;
        this.config.server = config.server;
        this.config.prefix = config.prefix;

        this.config.channels = {
            guild: config?.channels?.guild,
            officer: config?.channels?.officer,
            events: config?.channels?.events,
            console: config?.channels?.console,
        };

        this.channels = new ChannelHandler(this);
        this.messageManager = new MessageManager(this);
        this.interactionManager = new InteractionManager(this);
        this.externalEventManager = new ExternalEventManager(this);
    }

    init() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.enabled = false;
                reject(`Failed to setup the ${this.id} approach in 60 seconds.`);
            }, 60_000);

            if(!this.config.token){
                reject(`Approach ${this.id} is not configured.`);
                return;
            }

            this.client = new Client({
                intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
            });

            this.client.login(this.config.token).catch((error) => {
                this.enabled = false;
                logger.error(`Failed to log into Discord at ${this.id}.`, error);
            });

            this.client.on('clientReady', () => {
                this.enabled = true;
                resolve();

                clearTimeout(timeout);
                logger.success(`Successfully logged in on "${this.id}" approach with client "${this.client.user.tag}"!`);
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
            else logger.error(`Channel "guild" not found on ${this.id}!`);

            await this.registerMessageHandler();
            await this.registerCommandHandler();
        }
        catch (e) {
            logger.error(`Failed to bring the approach ${this.id} to normal operation.`, e);
            this.enabled = false;
        }
    }

    async registerMessageHandler() {
        this.client.on('messageCreate', async (message) => {
            try {
                await this.messageManager.handle(message);
            }
            catch (e) {
                console.log(e);
            }
        });
    }

    async registerCommandHandler() {
        this.commands = new Collection();

        const commandFiles = fs.readdirSync('src/discord/commands').filter((file) => file.endsWith('.js'));

        const command_list = [];

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            this.commands.set(command.name, command);
            command_list.push(command);
        }

        const rest = new REST({ version: '10' }).setToken(this.config.token);

        const clientID = Buffer.from(this.config.token.split('.')[0], 'base64').toString('ascii');

        try {
            await rest.put(Routes.applicationGuildCommands(clientID, this.config.server), { body: command_list });
        }
        catch (e) {
            logger.error(`Encountered an error while registering commands`, e);
        }

        this.client.on('interactionCreate', async (interaction) => {
            try {
                await this.interactionManager.handle(interaction);
            }
            catch (e) {
                logger.warn(`Error while handling the command...`, e);
                try {
                    const errorStack = (e.stack ?? e ?? 'Unknown').toString().slice(0, 1000);
                    let error_message = `Error message:\n\`\`\`${e?.message || "Unknown error."}\`\`\`\nError stack:\n\`\`\`${errorStack}\`\`\``;

                    if (e instanceof UserError) {
                        error_message = `\`\`\`${e?.message || "Unknown error."}\`\`\``;
                    }

                    let embed = new EmbedBuilder();

                    embed
                        .setTitle('Failed to execute your command!')
                        .setDescription(error_message)
                        .setColor(0x800000);

                    await interaction.editReply({ embeds: [embed] });
                } catch (err) {
                    logger.error(`Failed to respond with error message.`, err)
                }
            }
        });
    }

    async handleEvent(event){
        await this.externalEventManager.handle(event);
    }
}

module.exports = DiscordApproach;