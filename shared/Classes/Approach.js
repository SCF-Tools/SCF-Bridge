const logger = require('#src/Logger.js');

class Approach {
    id;
    type;
    /**
     * @type {import("../../src/Application.js")}
     */
    #app = null;

    enabled = false;

    constructor(type, id) {
        this.type = type;
        this.id = id;
    }

    setApplication(application) {
        this.#app = application;
    }

    /**
     * @param {import('../Events/GenericEvent.js')} event
     */
    async emitEvent(event) {
        if (!this.enabled) {
            return;
        }

        if (!this.#app) {
            logger.error(`No application defined at approach "${this.id}".`);
            return;
        }

        try {
            await this.#app.routeEvent(event);
        } catch (e) {
            logger.error(`Failed to emit event!`, event);
            console.log(e);
        }
    }

    /**
     * @param {import('../Events/GenericEvent.js')} event
     */
    async handleEvent(event) {
        throw new Error('Event handling was not implemented.');
    }
}

module.exports = Approach;
