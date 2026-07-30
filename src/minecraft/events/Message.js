const Logger = require("#root/src/Logger.js");
const InboundMinecraftMessage = require("#shared/Events/InboundMinecraftMessage.js");
const parser = require("#shared/ParseHypixelMessage.js");

class MessageManager {
    /**
     * @type {import("../MinecraftApproach")}
     */
    minecraft;

    constructor(minecraft_instance) {
        this.minecraft = minecraft_instance;
    }

    async handle(message) {
        /**
         * @type {String}
         */
        const cleanMessage = message.toString();
        /**
         * @type {String}
         */
        const coloredMessage = message.toMotd();

        this.minecraft.emitEvent(new InboundMinecraftMessage(this.minecraft.id, cleanMessage, coloredMessage)).catch((e) => {
            console.log(e);
        });

        if (cleanMessage.includes(' the lobby!') && cleanMessage.includes('[MVP+') && !cleanMessage.includes(':')) {
            this.minecraft.bot.chat('/limbo');
            return;
        }
        if (cleanMessage.includes('You are currently connected to') && !cleanMessage.includes(':')) {
            this.minecraft.bot.chat('/limbo');
            return;
        }

        if(parser.hypixelMute(cleanMessage).found) {
            Logger.error("Detected Hypixel mute message, exiting to prevent further issues.");
            process.exit(123);
        }

        /*let guildJoinRequest = parser.guildJoinRequest(cleanMessage);
        let guildJoin = parser.guildJoin(cleanMessage);

        if (guildJoinRequest.found) {
            try{
                let uuid = await 
            }
            catch(e) {
                this.minecraft.bot.chat(`/oc Could not check guild member information automatically.`);
                return;
            }
            
        }*/
    }
}

module.exports = MessageManager;
