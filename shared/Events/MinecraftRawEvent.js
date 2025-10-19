const GenericEvent = require("./GenericEvent.js");

class MinecraftRawEvent extends GenericEvent{
    emitter_id;
    type = "minecraft_raw";

    payload = {
        message: "",
    };

    constructor(emitter_id, message){
        super(emitter_id);

        this.emitter_id = emitter_id;
        this.payload.message = message;
    }
}

module.exports = MinecraftRawEvent;