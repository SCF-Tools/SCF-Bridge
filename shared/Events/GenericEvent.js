class GenericEvent{
    emitter_id;
    type = "generic";

    payload = {};

    constructor(emitter_id){
        this.emitter_id = emitter_id;
    }
}

module.exports = GenericEvent;