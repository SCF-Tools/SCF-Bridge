const logger = require("#root/src/Logger.js");
const GenericEvent = require("#shared/Events/GenericEvent.js");

class Approach{
    id;
    type;
    #emitter;

    enabled = false;

    constructor(type, id){
        this.type = type;
        this.id = id;
    }
    
    setEmitter(emitter){
        this.#emitter = emitter;
    }
    
    /**
     * @param {GenericEvent} event 
     */
    async emitEvent(event){
        if(!this.enabled){
            return;
        }
        
        if(!this.#emitter){
            logger.error(`No emitter found at approach "${this.id}".`);
        }

        try{
            await this.#emitter(event);
        }
        catch(e){
            logger.error(`Failed to emit event!`, event);
            console.log(e);
        }
    }

    /**
     * @param {GenericEvent} event 
     */
    async handleEvent(event){
        throw new Error("Event handling was not implemented.")
    }
}

module.exports = Approach;