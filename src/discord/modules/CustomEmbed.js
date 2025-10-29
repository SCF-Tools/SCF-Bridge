const { EmbedBuilder } = require("discord.js");
const config = require("#root/Config.js").get();

class CustomEmbed extends EmbedBuilder {
    constructor(){
        super();
        this.setFooter(
            {
                text: 'Guild Bridge | /help for more info',
                iconURL: config.identity.logo
            }
        );
    }
}

module.exports = CustomEmbed;