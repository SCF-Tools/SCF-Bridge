const Logger = require('#src/Logger.js');
const cache = require('#shared/CacheManager.js');
const config = require('#root/Config.js').get();


module.exports = {
    banlists: {
        async SCF(uuid) {
            if (!config.SCF) {
                return {
                    banned: false,
                    reason: null
                };
            }

            const banlist_info = await config.SCF.API.server.isBlacklisted(uuid);

            return {
                banned: banlist_info.banned,
                reason: banlist_info.reason || null
            };
        }
    },

    async check(uuid) {
        for (const banlist of Object.entries(this.banlists)) {
            const banlist_name = banlist[0];
            const banlist_func = banlist[1];

            try {
                const result = await cache.fetch(`${banlist_name}-${uuid}`, 10 * 1000, async () => {
                    return await banlist_func(uuid);
                });

                if (result.banned) {
                    return {
                        banned: true,
                        flagged_by: banlist_name,
                        reason: result.reason
                    };
                }
            } catch (e) {
                Logger.error(`Request to banlist ${banlist_name} failed.`);
            }
        }
        return {
            banned: false,
            flagged_by: null,
            reason: null
        };
    }
};
