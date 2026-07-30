const cache = require('#shared/CacheManager.js');
const config = require('#root/Config.js').get();
const axios = require('axios');

class Mojang {
    /**
     * @typedef {Object} MinecraftProfile
     * @property {String|null} uuid
     * @property {String|null} nick
     */

    /**
     * @param {String} nick
     * @returns {Promise<MinecraftProfile>}
     */
    async fetchByNick(nick) {
        nick = nick.toString().toLowerCase();

        const proxy_url = config.API.Mojang.nick_proxy ? `${config.API.Mojang.nick_proxy}${nick}` : null;

        const profile = await cache.fetch(`mojang-nick-${nick}`, 15 * 60 * 1000, async () => {
            return await this.handleRequest(proxy_url, `https://api.mojang.com/users/profiles/minecraft/${nick}`);
        });

        return profile;
    }

    /**
     * @param {String} uuid
     * @returns {Promise<MinecraftProfile>}
     */
    async fetchByUUID(uuid) {
        uuid = uuid.toString().toLowerCase();
        const proxy_url = config.API.Mojang.uuid_proxy ? `${config.API.Mojang.uuid_proxy}${uuid}` : null;

        const profile = await cache.fetch(`mojang-uuid-${uuid}`, 15 * 60 * 1000, async () => {
            return await this.handleRequest(
                proxy_url,
                `https://api.minecraftservices.com/minecraft/profile/lookup/${uuid}`
            );
        });

        return profile;
    }

    async handleRequest(proxy_url, fallback_url) {
        const response = {
            uuid: null,
            nick: null
        };

        if (proxy_url) {
            try {
                const proxy_response = await axios.get(proxy_url);

                if (proxy_response.data.id) {
                    response.uuid = proxy_response.data.id;
                    response.nick = proxy_response.data.name;

                    return response;
                }
            } catch (e) {
                if (e instanceof axios.AxiosError) {
                    if ([404, 400].includes(e.status)) {
                        return response;
                    }
                }
            }
        }

        try {
            const fallback_response = await axios.get(fallback_url);

            if (fallback_response.data.id) {
                response.uuid = fallback_response.data.id;
                response.nick = fallback_response.data.name;
            }
        } catch (e) { /* ignore */ }

        return response;
    }
}

module.exports = new Mojang();
