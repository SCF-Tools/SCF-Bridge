const GenericEvent = require('./GenericEvent.js');

class OutboundMinecraftMessage extends GenericEvent {
    emitter_id;
    type = 'outbound_minecraft_message';

    payload = {
        message: ''
    };

    constructor(emitter_id, message) {
        super(emitter_id);

        this.emitter_id = emitter_id;
        this.payload.message = message;
    }
}

module.exports = OutboundMinecraftMessage;
