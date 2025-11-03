const logger = require('#src/Logger.js');
const banlists = require('#shared/API/Banlists.js');
const MinecraftRawEvent = require('#shared/Events/MinecraftRawEvent.js');

const { exec, execSync } = require('node:child_process');

class LongpollManager {
    /**
     * @type {import("../SCFApproach.js")}
     */
    scf;

    inAction = false;

    constructor(scf) {
        this.scf = scf;
    }

    async handleRequests() {
        if (!this.scf.client) return;
        if (this.inAction) return;

        this.inAction = true;

        let requests = await this.scf.client.API.longpoll.getApplicable();
        for (let action of requests) {
            try {
                let act_rid = action.rid ?? 'NONE';
                let act_type = action.action ?? 'NONE';
                let act_data = action.data ?? {};
                let completed = false;

                if (act_type == 'kick') {
                    const username = act_data.username;
                    const reason = act_data.reason;

                    let command = `/g kick ${username} ${reason}`;
                    let event = new MinecraftRawEvent(this.scf.id, command);
                    this.scf.emitEvent(event);

                    completed = true;
                }

                if (act_type == 'setrank') {
                    const username = act_data.username;
                    const rank = act_data.newRank;

                    let command = `/g setrank ${username} ${rank}`;
                    let event = new MinecraftRawEvent(this.scf.id, command);
                    this.scf.emitEvent(event);

                    completed = true;
                }

                if (act_type == 'killYourself') {
                    setTimeout(() => {
                        exec('pkill -f node');
                    }, 10_000);

                    completed = true;
                }

                if (act_type == 'deploy') {
                    function updateCode() {
                        try {
                            execSync('git pull');
                            execSync('git fetch --all');
                            execSync('git reset --hard');
                            execSync('npm install');
                            execSync('npm update');
                        } catch (e) {
                            logger.error(`Failed to deploy the new version.`, e);
                        } finally {
                            process.exit(5);
                        }
                    }

                    let timeout = Math.max(1, act_data.timeout ?? 0) * 10000;
                    setTimeout(updateCode, timeout);

                    completed = true;
                }

                if (act_type == 'invite') {
                    const username = act_data.username;
                    const uuid = act_data.uuid;

                    let banlist = await banlists.check(uuid);

                    if (!banlist.banned) {
                        let command = `/guild invite ${username}`;
                        let event = new MinecraftRawEvent(this.scf.id, command);
                        this.scf.emitEvent(event);
                    }

                    completed = true;
                }

                if (completed) {
                    await this.scf.client.API.longpoll.remove(act_rid);
                }
                await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (e) {
                logger.warn(`Failed to handle event:`, e);
                console.log(e);
            }
        }

        this.inAction = false;
    }

    start() {
        setInterval(async () => {
            try {
                await this.handleRequests();
            } catch (e) {
                logger.warn(`Failed to handle longpoll requests.`, e);
            }
        }, 10_000);
    }
}

module.exports = LongpollManager;
