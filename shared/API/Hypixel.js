const cache = require('#shared/CacheManager.js');
const config = require('#root/Config.js').get();
const axios = require('axios');

module.exports = {
    async fetch(url) {
        const proxy_url = config.API.Hypixel.proxy ? url.replace('api.hypixel.net', config.API.Hypixel.proxy) : null;

        const response = await cache.fetch(`hypixel-${url}`, 30 * 60 * 1000, async () => {
            return await this.handleRequest(proxy_url, url);
        });

        return response;
    },

    async handleRequest(proxy_url, fallback_url) {
        const headers = {
            headers: {
                'API-Key': config.API.Hypixel.key
            }
        };

        if (proxy_url) {
            try {
                const proxy_response = (await axios.get(proxy_url, headers)).data;
                return proxy_response;
            } catch (e) { /* ignore */ }
        }

        return (await axios.get(fallback_url, headers)).data;
    }
};
