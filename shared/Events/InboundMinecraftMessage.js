const GenericEvent = require('./GenericEvent.js');

class InboundMinecraftMessage extends GenericEvent {
    emitter_id;
    type = 'inbound_minecraft_message';

    payload = {
        message: '',
        colored: ''
    };

    constructor(emitter_id, message, colored) {
        super(emitter_id);

        this.emitter_id = emitter_id;
        this.payload.message = message;
        this.payload.colored = colored;
    }
}

module.exports = InboundMinecraftMessage;
