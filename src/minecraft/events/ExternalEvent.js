const MinecraftRawEvent = require("#shared/Events/MinecraftRawEvent.js");
const GenericEvent = require("#shared/Events/GenericEvent.js");

class ExternalEventManager {
    /**
     * @type {import("../MinecraftApproach")}
     */
    minecraft;

    constructor(minecraft_instance) {
        this.minecraft = minecraft_instance;
    }

    /**
     * @param {GenericEvent} event 
     */
    async handle(event) {
        if (event instanceof MinecraftRawEvent) {
            this.minecraft.bot.chat(event.payload.message);
        }

    }
}

module.exports = ExternalEventManager;