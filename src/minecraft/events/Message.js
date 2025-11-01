const DiscordConsoleEvent = require('#shared/Events/DiscordConsoleEvent.js');

class MessageManager {
    /**
     * @type {import("../MinecraftApproach")}
     */
    minecraft;

    constructor(minecraft_instance) {
        this.minecraft = minecraft_instance;
    }

    async handle(message) {
        /**
         * @type {String}
         */
        const cleanMessage = message.toString();
        /**
         * @type {String}
         */
        const coloredMessage = message.toMotd();

        this.minecraft.emitEvent(new DiscordConsoleEvent(this.minecraft.id, coloredMessage)).catch((e) => {
            console.log(e);
        });

        if (cleanMessage.includes(' the lobby!') && cleanMessage.includes('[MVP+') && !cleanMessage.includes(':')) {
            this.minecraft.bot.chat('/limbo');
            return;
        }
        if (cleanMessage.includes('You are currently connected to') && !cleanMessage.includes(':')) {
            this.minecraft.bot.chat('/limbo');
            return;
        }

        const patterns = {
            player_join: /^Guild > [^:]* joined\.$/gmi,
            player_leave: /^Guild > [^:]* left\.$/gmi,
        };

        if (patterns.player_join.test(cleanMessage)) {
            const nick = cleanMessage.split(" ")[2];
            console.log(nick);
        }

        if (patterns.player_leave.test(cleanMessage)) {
            const nick = cleanMessage.split(" ")[2];
            console.log(nick);
        }
    }
}

module.exports = MessageManager;
