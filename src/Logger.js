const chalk = require("chalk");

module.exports = {
    print(prefix, message, raw = null) {
        console.log(`${prefix} ${message}`);
        if (raw !== null) {
            console.log(raw);
        }
    },

    info(message, raw = null) {
        this.print(
            chalk.inverse(" Info "),
            chalk.whiteBright(message),
            raw
        );
    },

    warn(message, raw = null) {
        this.print(
            chalk.bgYellowBright.whiteBright(" Warn "),
            chalk.yellowBright(message),
            raw
        );
    },

    success(message, raw = null) {
        this.print(
            chalk.bgGreenBright.whiteBright(" Success "),
            chalk.greenBright(message),
            raw
        );
    },

    error(message, raw = null) {
        this.print(
            chalk.bgRedBright.whiteBright(" Error "),
            chalk.redBright(message),
            raw
        );
    },
};