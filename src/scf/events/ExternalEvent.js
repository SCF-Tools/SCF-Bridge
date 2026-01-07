const InboundMinecraftMessage = require('#shared/Events/InboundMinecraftMessage.js');
const parser = require('#shared/ParseHypixelMessage.js');
const Mojang = require('#shared/API/Mojang.js');
const Logger = require('#root/src/Logger.js');

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
        if (event instanceof InboundMinecraftMessage) {
            let message = event.payload.message;

            let guildLeave = parser.guildLeave(message);
            let guildKick = parser.guildKick(message);

            if (guildLeave.found || guildKick.found) {
                let nick = guildLeave.parts.nick || guildLeave.parts.nick;
                let uuid = await Mojang.fetchByNick(nick);

                if (!uuid) {
                    Logger.error(`[SCF API] Failed to handle leave event, no UUID found!`, nick);
                    return;
                }

                await this.scf.client.API.longpoll.create('userLeave', 'scf_management', {
                    version: 1,
                    uuid: uuid
                })

                return;
            }
        }
    }
}

module.exports = ExternalEventManager;
