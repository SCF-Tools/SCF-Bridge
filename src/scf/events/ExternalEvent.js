class ExternalEventManager {
    /**
     * @type {import("../SCFApproach")}
     */
    scf;

    constructor(scf_instance) {
        this.scf = scf_instance;
    }

    /**
     * @param {import("#shared/Events/GenericEvent.js")} event 
     */
    async handle(event) {
        /*if (event instanceof MinecraftRawEvent) {
            this.minecraft.bot.chat(event.payload.message);
        }*/

    }
}

module.exports = ExternalEventManager;