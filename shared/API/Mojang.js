const cache = require("#shared/CacheManager.js");
const config = require("#root/Config.js").get();
const axios = require("axios");

class Mojang {
    /**
     * @typedef {Object} MinecraftProfile
     * @property {String|null} uuid
     * @property {String|null} nick
     */

    /**
     * @param {String} nick 
     * @returns {MinecraftProfile}
     */
    async fetchByNick(nick) {
        nick = nick.toString().toLowerCase();

        let proxy_url = config.API.Mojang.nick_proxy ?
            `${config.API.Mojang.nick_proxy}${nick}` :
            null;

        let profile = await cache.fetch(`mojang-nick-${nick}`, 15 * 60 * 1000, async () => {
            return await this.handleRequest(
                proxy_url,
                `https://api.mojang.com/users/profiles/minecraft/${nick}`
            )
        });

        return profile;
    }

    /**
     * @param {String} uuid 
     * @returns {MinecraftProfile}
     */
    async fetchByUUID(uuid){
        uuid = uuid.toString().toLowerCase();
        let proxy_url = config.API.Mojang.uuid_proxy ?
            `${config.API.Mojang.uuid_proxy}${uuid}` :
            null;

        let profile = await cache.fetch(`mojang-uuid-${uuid}`, 15 * 60 * 1000, async () => {
            return await this.handleRequest(
                proxy_url,
                `https://api.minecraftservices.com/minecraft/profile/lookup/${uuid}`
            )
        });

        return profile;
    }

    async handleRequest(proxy_url, fallback_url) {
        let response = {
            uuid: null,
            nick: null,
        };

        if (proxy_url) {
            try {
                let proxy_response = (await axios.get(proxy_url));

                if (proxy_response.data.id) {
                    response.uuid = proxy_response.data.id;
                    response.nick = proxy_response.data.name;

                    return response;
                }
            }
            catch (e) {
                if (e instanceof axios.AxiosError) {
                    if (["404", "400"].includes(e.status)) {
                        return response;
                    }
                }
            }
        }

        try {
            let fallback_response = (await axios.get(fallback_url));

            if (fallback_response.data.id) {
                response.uuid = fallback_response.data.id;
                response.nick = fallback_response.data.name;
            }
        }
        catch (e) {}

        return response;
    }
}

module.exports = new Mojang();