const Approach = require("#shared/Approaches/Approach.js");
const logger = require("#src/Logger.js");

const MessageManager = require("./events/Message.js");
const ExternalEventManager = require("./events/ExternalEvent.js");

const mineflayer = require('mineflayer');

class MinecraftApproach extends Approach {
    config = {};

    /**
     * @type {import("mineflayer").Bot}
     */
    bot;

    /**
     * @type {MessageManager} 
     */
    messageManager;
    /**
     * @type {ExternalEventManager} 
     */
    externalEventManager;

    loginAttempts = 0;

    constructor(approach_id, config) {
        super("minecraft", approach_id);

        this.messageManager = new MessageManager(this);
        this.externalEventManager = new ExternalEventManager(this);
    }

    init() {
        return new Promise((resolve, reject) => {
            try {
                let timeout = setTimeout(() => {
                    try {
                        this.enabled = false;
                        this.bot.on("end", () => { });
                        this.bot.end("force");
                    }
                    catch (e) { }
                    reject(`Failed to setup the ${this.id} approach in 180 seconds.`);
                }, 3 * 60 * 1000);

                this.bot = mineflayer.createBot({
                    host: 'mc.hypixel.net',
                    port: 25565,
                    auth: 'microsoft',
                    version: '1.8.9',
                    viewDistance: 'tiny',
                    chatLengthLimit: 255,
                    profilesFolder: './auth-cache'
                });

                this.startOperation();

                this.bot.on('login', () => {
                    this.loginAttempts = 0;
                    this.enabled = true;

                    resolve();

                    clearTimeout(timeout);
                    logger.success(`Successfully logged in on "${this.id}" approach with client "${this.bot.username}"!`);
                });

                this.bot.on("end", (reason) => {
                    this.enabled = false;
                    if (reason === 'force') {
                        return;
                    }

                    this.loginAttempts++;

                    const loginDelay = this.loginAttempts * 5_000;

                    logger.warn(`${this.id}'s bot has disconnected (#${this.loginAttempts}). Will reconnect in ${loginDelay / 1000} seconds.`);

                    if (this.loginAttempts >= 5) {
                        process.exit(123);
                    }

                    setTimeout(async () => {
                        await this.init();
                    }, loginDelay);
                });

                this.bot.on("kicked", (reason) => {
                    this.enabled = false;
                    logger.warn(`Minecraft bot has been kicked from the server.`, reason);

                    process.send({
                        id: 'warning',
                        info: `Minecraft bot has been kicked from the server for "${JSON.stringify(reason)}"`
                    });
                });
            }
            catch (e) {
                logger.warn(`Uncaught exception in ${this.id}.`, e);
            }
        });
    }

    isConnected() {
        if (this.bot === undefined || this.bot._client.chat === undefined) {
            return false;
        }
        return true;
    }

    async startOperation() {
        this.bot.on('message', async (message) => {
            try{
                await this.messageManager.handle(message);
            }
            catch(e){
                console.log(e);
            }
        });
    }

    async handleEvent(event){
        await this.externalEventManager.handle(event);
    }
}

module.exports = MinecraftApproach;