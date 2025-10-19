const GenericEvent = require("./GenericEvent.js");

/**
 * @typedef {Object} SenderInfo
 * @property {?String} display_name
 * @property {?String} uuid
 * @property {?String} guild_id
 * 
 * @typedef {Object} MessagePayload
 * @property {SenderInfo} player
 * @property {?String} message
 */

class MessageGuildEvent extends GenericEvent{
    emitter_id;
    type = "message_guild";

    /**
     * @type {MessagePayload}
     */
    payload = {
        player: {},
        message: "",
    };

    constructor(emitter_id, player, message){
        super(emitter_id);
        
        this.emitter_id = emitter_id;
        this.payload.player = player;
        this.payload.message = message;
    }
}

module.exports = MessageGuildEvent;