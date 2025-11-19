const GenericEvent = require('./GenericEvent.js');

/**
 * @typedef {Object} SenderInfo
 * @property {?String} display_name
 * @property {?String} uuid
 * @property {?String} guild_id
 *
 * @typedef {Object} MessagePayload
 * @property {SenderInfo} player
 * @property {?String} channel
 * @property {?String} message
 */

class InboundDiscordMessage extends GenericEvent {
    emitter_id;
    type = 'inbound_discord_message';

    channels = {
        GUILD: "guild",
        OFFICER: "officer",
        CONSOLE: "console",
    }

    /**
     * @type {MessagePayload}
     */
    payload = {
        message: '',
        channel: '',
        player: {}
    };

    constructor(emitter_id, message, channel, player) {
        super(emitter_id);

        this.emitter_id = emitter_id;
        this.payload.message = message;
        this.payload.channel = channel;
        this.payload.player = player;
    }
}

module.exports = InboundDiscordMessage;
