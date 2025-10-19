const UserError = require("#src/discord/modules/UserError.js");
const MinecraftRawEvent = require("#shared/Events/MinecraftRawEvent.js");
const MessageGuildEvent = require("#root/shared/Events/MessageGuildEvent.js");
const MessageOfficerEvent = require("#root/shared/Events/MessageOfficerEvent.js");

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
        if(!this.minecraft.isConnected()){
            return;
        }

        if (event instanceof MinecraftRawEvent) {
            this.minecraft.bot.chat(event.payload.message);
        }

        if(event instanceof MessageGuildEvent || event instanceof MessageOfficerEvent){
            let message = event.payload.message;
            let nick = event.payload.player.display_name;
            let channel = "/gc";

            if(event instanceof MessageOfficerEvent) channel = "/oc";

            this.minecraft.bot.chat(`${channel} ${nick} » ${message}`);
        }
    }
}

module.exports = ExternalEventManager;