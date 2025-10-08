const config_loader = require("#root/Config.js");
const logger = require("#src/Logger.js");
/**
 * @type {import('node:cluster').default}
 */
const cluster = require('node:cluster');
/**
 * @type {import('axios').Axios}
 */
const axios = require('axios');


async function bootstrap() {
    await config_loader.fetch();
    if (cluster.isPrimary) {
        await initParent();
    }
    if (cluster.isWorker) {
        await initChild();
    }
}

bootstrap();

/**
 * Init parent process
 */

async function initParent() {
    const config = config_loader.get();

    async function useWebhook(message, color = 0x800000) {
        let params = {
            content: config.errors.role,
            embeds: [
                {
                    title: 'The bridge has sent an update',
                    fields: [
                        {
                            name: 'Information',
                            value: `${message}\nInstance: \`${config.identity.unique_id}\``
                        }
                    ],
                    color: color
                }
            ]
        };

        axios.post(config.errors.webhook, params, {
            headers: {
                'Content-type': 'application/json',
                "Authorization": config.approaches.discord.token
            }
        })
    }

    async function handleEvent(event) {
        if (event.id === 'exception') {
            await useWebhook(`An exception was caught:\n\`\`\`${event.toString()}\`\`\``, 0x800000);
        }
        if (event.id === 'init') {
            await useWebhook(`The bridge has initialized successfully.`, 0x008000);
        }
    }

    async function handleState() {
        if (state == states.TERMINATED) {
            for (const id in cluster.workers) {
                cluster.workers[id].kill();
            }
            return;
        }

        if (state == states.STOPPED) {
            cluster.fork({
                ...process.env
            });

            state = states.STARTED;

            for (const id in cluster.workers) {
                cluster.workers[id].on('message', handleEvent);
            }
        }
    }

    async function handleEmergencyLongpoll() {
        try {
            if (!config.SCF) return;
            let requests = await config.SCF.API.longpoll.getApplicable();

            for (let action of requests) {
                try {
                    let act_rid = action.rid ?? 'NONE';
                    let act_type = action.action ?? 'NONE';
                    let act_data = action.data ?? {};
                    let completed = false;

                    if (act_type == 'forceReboot') {
                        for (const id in cluster.workers) {
                            cluster.workers[id].kill();
                        }

                        state = states.STOPPED;
                        completed = true;
                    }

                    if (act_type == 'killYourself') {
                        setTimeout(() => { process.exit() }, 10000);

                        completed = true;
                    }

                    if (completed) {
                        await config.SCF.API.longpoll.remove(act_rid);
                    }
                }
                catch (e) {
                    logger.warn(`Failed to handle a longpoll request!`, action);
                    console.log(e);
                }
            }
        }
        catch (e) {
            logger.warn(`Encountered an error while handling emergency longpoll.`, e);
        }
    }

    let states = {
        TERMINATED: -1,
        STOPPED: 0,
        STARTED: 1,
    }

    let state = states.STOPPED;

    handleState();
    setInterval(handleState, 5000);
    setInterval(handleEmergencyLongpoll, 30000);

    cluster.on('exit', function (worker, code, signal) {
        state = states.STOPPED;

        logger.warn(`The bridge has stopped with a ${code} error code.`);

        if (code == 123) {
            state = states.TERMINATED;
            useWebhook("Something bad has happened to the bot, maybe it's banned or muted. The app will shut down.");
            logger.error("The bridge has stopped due to a fatal error requiring manual maintenance. The bridge will not reboot. The parent process is still running.");
        }

        if (code == 124) {
            useWebhook("Bot failed to connect to Hypixel in the provided time limit. Will attempt to reconnect after a restart.");
            logger.error("Bot failed to connect to Hypixel in the provided time limit.");
        }

        if (code == 5) {
            logger.warn("The bridge is deploying a new version...")
        }
    });
}

/**
 * Init child process
 */

async function initChild() {
    const Application = require("#root/src/Application.js");

    process.on('uncaughtException', (error) => {
        logger.error(`Caught an uncaught exception!`, error);
        process.send({
            id: 'exception',
            exception: error
        });
        process.exit(1);
    });

    process.on('unhandledRejection', function (err, promise) {
        logger.error("Caught an unhandled rejection!", err);
        console.log(err, promise);
        process.exit(1);
    });

    const app = new Application();
    await app.init();
}