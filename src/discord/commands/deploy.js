const DiscordCommand = require("../modules/DiscordCommand.js");
const UserError = require("../modules/UserError.js");
const CustomEmbed = require("../modules/CustomEmbed.js");
const Permissions = require("../modules/PermissionManager.js");

class DeployCommand extends DiscordCommand {
    name = "deploy";
    description = "Manually updates the bridge to use the latest version from GitHub.";
    options = [];

    /**
     * @param {import("discord.js").CommandInteraction} interaction 
     */
    async execute(interaction) {
        Permissions.canExecute(interaction.member, Permissions.tiers.ADMINISTRATOR);

        function updateCode() {
            try {
                execSync('git pull');
                execSync('git fetch --all');
                execSync('git reset --hard');
                execSync('npm install');
                execSync('npm update');
            }
            catch (e) {
                logger.error(`Failed to deploy the new version.`, e);
            }
            finally {
                process.exit(5);
            }
        }

        setTimeout(updateCode, 10_000);

        let response = new CustomEmbed()
            .setColor(0x008000)
            .setTitle("Deploy is scheduled...")
            .setDescription(`The bridge will restart to deploy the latest version in 10 seconds.`)

        await interaction.followUp({ embeds: [response] });
    }
}

module.exports = new DeployCommand();