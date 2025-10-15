const MinecraftRawEvent = require("#shared/Events/MinecraftRawEvent.js");

class ExternalEventManager {
    /**
     * @type {import("../MinecraftApproach")}
     */
    minecraft;

    constructor(minecraft_instance) {
        this.minecraft = minecraft_instance;
    }

    /**
     * @param {import("#shared/Events/GenericEvent.js")} event 
     */
    async handle(event) {
        if (event instanceof MinecraftRawEvent) {
            this.minecraft.bot.chat(event.payload.message);
        }

    }
}

module.exports = ExternalEventManager;