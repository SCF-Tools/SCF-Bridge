const Logger = require('#src/Logger.js');
const cache = require('#shared/CacheManager.js');
const config = require('#root/Config.js').get();
const axios = require('axios');

module.exports = {
    banlists: {
        async SCF(uuid) {
            if (!config.SCF) {
                return {
                    banned: false,
                    reason: null
                };
            }

            let banlist_info = await config.SCF.API.server.isBlacklisted(uuid);

            return {
                banned: banlist_info.blacklisted,
                reason: banlist_info.reason || null
            };
        },
        async SkyKings(uuid) {
            if (!config.API.SkyKings.key) {
                return {
                    banned: false,
                    reason: null
                };
            }

            let response = await axios.get(`https://api.skykings.net/user/lookup`, {
                params: {
                    uuid: uuid
                },
                headers: {
                    Authorization: config.API.SkyKings.key
                }
            });

            return {
                banned: response.data?.result?.scammer || false,
                reason: response.data?.result?.reason || null
            };
        }
    },

    async check(uuid) {
        for (let banlist of Object.entries(this.banlists)) {
            let banlist_name = banlist[0];
            let banlist_func = banlist[1];

            try {
                let result = await cache.fetch(`${banlist_name}-${uuid}`, 10 * 1000, async () => {
                    return await banlist_func(uuid);
                });
                if (result.banned) {
                    return {
                        banned: true,
                        flagged_by: banlist_name
                    };
                }
            } catch (e) {
                Logger.error(`Request to banlist ${banlist_name} failed.`);
            }
        }
        return {
            banned: false,
            flagged_by: null
        };
    }
};
