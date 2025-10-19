require('dotenv').config({
    quiet: true
});

const logger = require("#src/Logger.js");
const SCFAPIClient = require("scf-api");

/**
 * @type {SCFAPIClient.default}
 */
let SCF;

class Config {
    #external = {
        fetched: false,
        config: {}
    };

    async fetch() {
        try {
            if (this.#external.fetched) return;
            if (!process.env.scf_api) {
                logger.warn(`No SCF API provided, will fall back to local environment variables.`);
                this.#external.fetched = true;
                return;
            }

            logger.info("Fetching external config...");

            /**
             * @type {SCFAPIClient.default}
             */
            let SCF_CONFIG_CLIENT = new SCFAPIClient(process.env.scf_api, process.env.discord_token);

            let config = await SCF_CONFIG_CLIENT.API.services.getConfig();

            this.#external.config = config;

            logger.success("Fetched external config!");
        }
        catch (e) {
            logger.error(`Failed to fetch the external config.`, e);
        }

        this.#external.fetched = true;
    }

    env(name) {
        if (!this.#external.fetched) {
            throw new Error('Trying to use an uninitialized external config.');
        }

        let process_env = process.env?.[name];
        let external_env = this.#external.config?.[name];

        let final_env = external_env ?? process_env;

        return final_env;
    }

    prepare() {
        if (process.env.scf_api && !SCF) {
            SCF = new SCFAPIClient(this.env("scf_api"), this.env("discord_token"), this.env("scf_token"));
            SCF.errorHandler((error) => {
                logger.error(`SCF API has encountered an error!`, error);
            });
        }
    }

    get() {
        this.prepare();

        return {
            SCF: SCF,
            identity: {
                unique_id: `${this.env('unique_id')} | Prefix: ${this.env('discord_prefix')}`,
                logo: this.env('logo_url')
            },
            permissions: {
                "EVERYONE": {
                    "name": "Everyone",
                    "level": 0,
                    "roles": []
                },
                "MODERATOR": {
                    "name": "Staff Team Member",
                    "level": 1,
                    "roles": [
                        "1048690255903072339", // SCF Jr. Moderator
                        "1048690255903072340", // SCF Moderator

                        "1266856339406192700", // SBU Guild Staff
                        "924332988743966751", // SBU Jr. Moderator
                        "801634222577156097", // SBU Moderator
                    ],
                },
                "ADMINISTRATOR": {
                    "name": "Management Team Member",
                    "level": 2,
                    "roles": [
                        "1370636617303195728", // SCF Jr. Administrator
                        "1048690255903072342", // SCF Administrator

                        "808070562046935060", // SBU Jr. Administrator
                        "766041783137468506", // SBU Administrator
                    ],
                },
                "COUNCIL": {
                    "name": "Council",
                    "level": 3,
                    "roles": [
                        "1220104308767588503", // SCF Council

                        "803275569356865556", // SBU Council
                        "1384958818634698792", // SBU Star
                    ],
                }
            },
            API: {
                Mojang: {
                    nick_proxy: "https://mojang.dssoftware.ru/?nick=",
                    uuid_proxy: "https://mojang.dssoftware.ru/?uuid=",
                },
                Hypixel: {
                    key: this.env("hypixel_token"),
                    proxy: "hypixel.dssoftware.ru"
                }
            },
            approaches: {
                minecraft: {
                    critical: true,
                },
                discord: {
                    critical: true,
                    token: this.env("discord_token"),
                    server: this.env("discord_server"),
                    prefix: this.env('discord_prefix'),
                    channels: {
                        guild: this.env("discord_channel_guild"),
                        officer: this.env("discord_channel_officer"),
                        events: this.env("discord_channel_events"),
                        console: this.env("discord_channel_console"),
                    }
                },
                replica: {
                    critical: false,
                    token: this.env("replica_token"),
                    server: this.env("replica_server"),
                    prefix: this.env('replica_prefix'),
                    channels: {
                        guild: this.env("replica_channel_guild"),
                        officer: this.env("replica_channel_officer"),
                        events: this.env("replica_channel_events"),
                        console: this.env("replica_channel_console"),
                    }
                },
                scf: {
                    critical: false,
                    client: SCF
                }
            },
            errors: {
                role: "<@476365125922586635><@\\&1249416749334396959>",
                webhook: "https://webhook.scfprojects.su/",
            },
            allowed_bots: []
        };
    }
}

module.exports = new Config();