class DiscordCommand {
    /**
     * @type {import("#shared/Classes/Approach.js")}
     */
    approach;

    name;
    description;
    options;

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        throw new Error(`Discord command "${this.name}" does not have an execute method implemented.`);
    }

    getProperties() {
        return {
            name: this.name,
            description: this.description,
            options: this.options
        };
    }
}

module.exports = DiscordCommand;
