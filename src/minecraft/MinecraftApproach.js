const Approach = require("#shared/Approaches/Approach.js");
const logger = require("#src/Logger.js");

const mineflayer = require('mineflayer');

class MinecraftApproach extends Approach {
    config = {};

    /**
     * @type {import("mineflayer").Bot}
     */
    bot;

    loginAttempts = 0;

    constructor(approach_id, config) {
        super("minecraft", approach_id);
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
                    reject(`Failed to setup the ${this.config.approach_id} approach in 180 seconds.`);
                }, 3 * 60 * 1000);

                this.bot = mineflayer.createBot({
                    host: 'mc.scfprojects.su',
                    port: 25565,
                    auth: 'microsoft',
                    version: '1.21.5',
                    viewDistance: 'tiny',
                    chatLengthLimit: 255,
                    profilesFolder: './auth-cache'
                });

                this.bot.on('login', () => {
                    this.loginAttempts = 0;
                    resolve();

                    clearTimeout(timeout);
                    logger.success(`Successfully logged in on "${this.id}" approach with client "${this.bot.username}"!`);
                    this.startOperation();
                });

                this.bot.on("end", (reason) => {
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
        this.bot.on("chat", (username, message) => {
            console.log(username, message);
        })
    }
}

module.exports = MinecraftApproach;