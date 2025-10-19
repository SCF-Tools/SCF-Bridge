const Approach = require("#shared/Approaches/Approach.js");
const logger = require("#src/Logger.js");

const LongpollManager = require("./modules/LongpollManager.js");
const ExternalEventManager = require("./events/ExternalEvent.js");

class SCFApproach extends Approach {
    /**
     * @type {import("scf-api").default}
     */
    client;

    /**
     * @type {LongpollManager}
     */
    longpollManager;

    /**
     * @type {ExternalEventManager} 
     */
    externalEventManager;

    constructor(approach_id, config) {
        super("scf", approach_id);

        this.client = config.client;

        this.longpollManager = new LongpollManager(this);
        this.externalEventManager = new ExternalEventManager(this);
    }

    init() {
        return new Promise(async (resolve, reject) => {
            if(!this.client){
                resolve();
                return;
            }

            try {
                let info = await this.client.API.token.me();
                
                if(!info.scf_id){
                    throw new Error("Invalid SCF ID");
                }

                this.enabled = true;

                resolve();

                logger.success(`Successfully logged in on "${this.id}" approach with client "${info.scf_id}"!`);
            }
            catch (e) {
                logger.warn(`Uncaught exception in ${this.id}.`, e);
                reject(`Caught an exception while init.`);
            }
        });
    }

    async startOperation() {
        this.longpollManager.start();
    }

    async handleEvent(event){
        await this.externalEventManager.handle(event);
    }
}

module.exports = SCFApproach;