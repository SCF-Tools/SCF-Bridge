const logger = require("#src/Logger.js");
const SCFApproach = require("../SCFApproach.js");
const MinecraftRawEvent = require("#shared/Events/MinecraftRawEvent.js");

const { exec } = require('node:child_process');

class LongpollManager {
    /**
     * @type {SCFApproach}
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
                    }, 10_000)
                    
                    completed = true;
                }

                /*
                if (act_type == 'invite') {
                    const username = act_data.username;

                    const uuid = await getUUID(username);
                    const skykings_scammer = await Skykings.lookupUUID(uuid);
                    const blacklisted = await Blacklist.checkBlacklist(uuid);
                    const scf_blacklisted = await SCFAPI.checkBlacklist(uuid);

                    // Checking the requirements

                    let passed_requirements = true;

                    try {
                        let profile = await getLatestProfile(uuid);

                        const skyblockLevel = (profile?.profile?.leveling?.experience || 0) / 100 ?? 0;
                        const dungeonsStats = getDungeons(profile.profile, undefined);
                        const catacombsLevel = Math.round(
                            dungeonsStats?.catacombs?.skill?.levelWithProgress || 0
                        );

                        // MAIN REQS
                        if (skyblockLevel < config.minecraft.guildRequirements.requirements.skyblockLevel) {
                            passed_requirements = false;
                        }
                        if (catacombsLevel < config.minecraft.guildRequirements.requirements.catacombsLevel) {
                            passed_requirements = false;
                        }
                        // MAIN REQS

                    } catch (e) {
                        // Failed to lookup player data.
                        Logger.warnMessage(e);
                    }
                    //

                    if (
                        skykings_scammer !== true &&
                        blacklisted !== true &&
                        scf_blacklisted !== true &&
                        passed_requirements === true
                    ) {
                        bot.chat(`/guild invite ${username}`);
                    }

                    completed = true;
                }
                if (act_type == 'forceInvite') {
                    const username = act_data.username;
                    const uuid = act_data.uuid;

                    const skykings_scammer = await Skykings.lookupUUID(uuid);
                    const blacklisted = await Blacklist.checkBlacklist(uuid);
                    const scf_blacklisted = await SCFAPI.checkBlacklist(uuid);

                    if (skykings_scammer !== true && blacklisted !== true && scf_blacklisted !== true) {
                        bot.chat(`/guild invite ${username}`);
                    }

                    completed = true;
                }
                if (act_type == 'deploy') {
                    async function updateCode() {
                        await asyncExec('git pull');
                        await asyncExec('git fetch --all');
                        await asyncExec('git reset --hard');
                        await asyncExec('npm install');
                        await asyncExec('npm update');

                        process.exit(5);
                    }

                    let timeout = (act_data.timeout ?? 0) * 10000;
                    setTimeout(updateCode, timeout);

                    completed = true;
                }*/

                if (completed) {
                    await this.scf.client.API.longpoll.remove(act_rid);
                }
                await new Promise(resolve => setTimeout(resolve, 500));
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
            }
            catch (e) {
                logger.warn(`Failed to handle longpoll requests.`, e);
            }
        }, 10_000);
    }
}

module.exports = LongpollManager;