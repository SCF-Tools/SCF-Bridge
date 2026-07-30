const GenericEvent = require('./GenericEvent.js');

class OutboundMinecraftMessage extends GenericEvent {
    emitter_id;
    type = 'outbound_minecraft_message';

    payload = {
        message: '',
        discord_message_id: null /* Optional */
    };

    constructor(emitter_id, message, discord_message_id = null) {
        super(emitter_id);

        this.emitter_id = emitter_id;
        this.payload.message = message;
        this.payload.discord_message_id = discord_message_id;
    }
}

module.exports = OutboundMinecraftMessage;
