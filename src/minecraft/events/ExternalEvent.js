const UserError = require("#src/discord/modules/UserError.js");
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
            if (!this.minecraft.isConnected()) {
                throw new UserError("The bridge is not ready.")
            }
            this.minecraft.bot.chat(event.payload.message);
        }

    }
}

module.exports = ExternalEventManager;