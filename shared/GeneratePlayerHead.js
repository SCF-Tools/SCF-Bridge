module.exports = {
    getURL: (id) => {
        const date = new Date();
        const day = `${date.getUTCDate()}${date.getUTCMonth()}${date.getUTCFullYear()}`;
        const url = `https://www.mc-heads.net/avatar/${id}?day=${day}`;

        return url;
    }
}