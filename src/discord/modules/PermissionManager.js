const config = require("#root/Config.js").get();
const UserError = require("./UserError.js");

module.exports = {
    tiers: config.permissions,

    /** 
     * @typedef {Object} PermissionTier
     * @property {String} name
     * @property {Number} level
     * @property {String[]} roles
     */

    /**
     * @param {import("discord.js").GuildMember} member 
     * @param {PermissionTier} requirement 
     * @param {Boolean} silent 
     */
    canExecute(member, requirement, silent=false){
        let level = 0;
        const userRoles = member.roles.cache.map((role) => role.id);

        for(const tier of Object.values(config.permissions)){
            for(const role of tier.roles){
                if(userRoles.includes(role)){
                    level = Math.max(tier.level, level);
                }
            }
        }

        if(level < requirement.level){
            if(silent){
                return false;
            }
            throw new UserError(`Missing permissions! You have to be at least ${requirement.name} to run this command.`);
        }

        return true;
    },
};
