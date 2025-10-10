const DiscordApproach = require("#src/discord/DiscordApproach.js");
const config = require("#root/Config.js").get();
const logger = require("#src/Logger.js");

class Application {
    approaches = [];

    async init() {
        let needed_approaches = {
            'discord': {
                class: DiscordApproach,
                config: config.approaches.discord
            },
        };

        let promises = [];

        for (const [approach_id, approach] of Object.entries(needed_approaches)) {
            promises.push(new Promise(async (resolve) => {
                try {
                    const instance = new approach.class(approach_id, approach.config);
                    await instance.init();
                    if (instance.enabled) {
                        this.approaches.push(instance);
                    }
                }
                catch (e) {
                    logger.error(`Failed to setup approach ${approach_id}!`, e)
                }
                resolve();
            }));
        }

        await Promise.allSettled(promises);
    }
}

module.exports = Application;