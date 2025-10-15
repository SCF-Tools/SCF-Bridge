const GenericEvent = require("./GenericEvent.js");

class DiscordConsoleEvent extends GenericEvent{
    emitter_id;
    type = "discord_console";

    payload = {
        message: "",
    };

    constructor(emitter_id, message){
        super(emitter_id);
        
        this.emitter_id = emitter_id;
        this.payload.message = message;
    }
}

module.exports = DiscordConsoleEvent;