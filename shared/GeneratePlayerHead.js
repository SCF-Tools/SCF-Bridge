module.exports = {
    getURL: (id) => {
        let date = new Date();
        let day = `${date.getUTCDay()}${date.getUTCMonth()}${date.getUTCFullYear()}`;
        let url = `https://www.mc-heads.net/avatar/${id}?day=${day}`;

        return url;
    }
}