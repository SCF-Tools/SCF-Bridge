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
            API: {
                
            },
            approaches: {
                discord: {
                    type: "discord",
                    token: this.env("discord_token"),
                    server: this.env("discord_server"),
                    channels: {
                        guild: this.env("discord_channel_guild"),
                        officer: this.env("discord_channel_officer"),
                        events: this.env("discord_channel_events"),
                        console: this.env("discord_channel_console"),
                    }
                },
                replica: {
                    type: "discord",
                    token: this.env("replica_token"),
                    server: this.env("replica_server"),
                    channels: {
                        guild: this.env("replica_channel_guild"),
                        officer: this.env("replica_channel_officer"),
                        events: this.env("replica_channel_events"),
                        console: this.env("replica_channel_console"),
                    }
                }
            },
            errors: {
                role: "<@1249416749334396959>",
                webhook: "https://webhook.scfprojects.su/",
            },
        };
    }
}

module.exports = new Config();