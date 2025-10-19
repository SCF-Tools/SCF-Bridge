const cache = new Map();

setInterval(() => {
    for(const key of cache.keys()){
        let timestamp = cache.get(key).expired;
        if(new Date().getTime() <= timestamp){
            continue;
        }

        cache.delete(key);
    }
}, 60_000);


module.exports = {
    async fetch(id, ttl, fetch_function){
        let cache_entry = this.isCached(id);

        if(cache_entry.found){
            return cache_entry.value;
        }

        let value = await fetch_function();
        
        cache.set(id, {
            expired: new Date().getTime() + ttl,
            value: value
        });

        return value;
    },

    isCached(id){
        let response = {
            found: false,
            value: null
        };

        if(!cache.has(id)){
            return response;
        }

        let cache_entry = cache.get(id);

        if(new Date().getTime() > cache_entry.expired){
            cache.delete(id);
            return response;
        }

        response.found = true;
        response.value = cache_entry.value;

        return response;
    }
};