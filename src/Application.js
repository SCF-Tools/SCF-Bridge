const Approach = require("#shared/Approaches/Approach.js");

const DiscordApproach = require("#src/discord/DiscordApproach.js");
const MinecraftApproach = require("#src/minecraft/MinecraftApproach.js");
const SCFApproach = require("#src/scf/SCFApproach.js");

const config = require("#root/Config.js").get();
const logger = require("#src/Logger.js");

class Application {
    /**
     * @type {Approach[]}
     */
    approaches = [];

    async init() {
        let needed_approaches = {
            'minecraft': {
                class: MinecraftApproach,
                config: config.approaches.minecraft
            },
            'discord': {
                class: DiscordApproach,
                config: config.approaches.discord
            },
            'replica': {
                class: DiscordApproach,
                config: config.approaches.replica
            },
            'scf': {
                class: SCFApproach,
                config: config.approaches.scf
            },
        };

        let promises = [];

        for (const [approach_id, approach] of Object.entries(needed_approaches)) {
            promises.push(new Promise(async (resolve) => {
                try {
                    const instance = new approach.class(approach_id, approach.config);
                    await instance.init();
                    if (instance.enabled) {
                        instance.setApplication(this);
                        this.approaches.push(instance);
                    }
                }
                catch (e) {
                    logger.warn(`Failed to setup approach ${approach_id}!`, e)
                    if(approach.config.critical){
                        process.exit(124);
                    }
                }
                resolve();
            }));
        }

        await Promise.allSettled(promises);

        process.send({
            id: 'init',
        });
    }

    /**
     * @param {import("../shared/Events/GenericEvent")}
     */
    async routeEvent(event){
        const promises = [];
        
        for(const approach of this.approaches){
            if(approach.id == event.emitter_id){
                continue;
            }
            if(!approach.enabled){
                continue;
            }

            promises.push(
                approach.handleEvent(event).catch(error => {
                    logger.error(`Error handling event in approach ${approach.id}`, error);
                })
            );
        }
        
        await Promise.allSettled(promises);
    }
}

module.exports = Application;