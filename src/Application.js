const Approach = require("#shared/Approaches/Approach.js");
const GenericEvent = require("#shared/Events/GenericEvent.js");
const DiscordApproach = require("#src/discord/DiscordApproach.js");
const config = require("#root/Config.js").get();
const logger = require("#src/Logger.js");

class Application {
    /**
     * @type {Approach[]}
     */
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
                        instance.setEmitter(this.routeEvent.bind(this));
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

    /**
     * @param {GenericEvent} event 
     */
    async routeEvent(event){
        for(const approach of this.approaches){
            if(approach.id == event.emitter_id){
                continue;
            }
            await approach.handleEvent(event);
        }
    }
}

module.exports = Application;