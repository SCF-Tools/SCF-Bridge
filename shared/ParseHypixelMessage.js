/**
 * Utility Functions
 */
function cleanMessage(message) {
    if (!message) return '';
    return message
        .replace(/^-{3,}\n?/gm, '') // Remove lines starting with 3+ dashes
        .replace(/\n?-{3,}$/gm, '') // Remove lines ending with 3+ dashes
        .trim();
}

/**
 * Messages related to mutes:
 */

function guildMute(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { staff: null, duration: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('has muted the guild chat for')) return response;

    const match = msg.match(/^(?:\[.+?\] )?(?<username>.+) has muted the guild chat for (?<duration>.+?)$/);

    if (match) {
        response.found = true;
        response.parts.staff = match.groups.username;
        response.parts.duration = match.groups.duration;
    }
    return response;
}

function guildUnmute(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { staff: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('has unmuted the guild chat!')) return response;

    const match = msg.match(/^(?:\[.+?\] )?(?<username>.+) has unmuted the guild chat!$/);

    if (match) {
        response.found = true;
        response.parts.staff = match.groups.username;
    }
    return response;
}

function userMute(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null, staff: null, duration: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('has muted') || !msg.includes('for') || msg.includes('guild chat')) return response;

    const match = msg.match(
        /^(?:\[.+?\] )?(?<username>.+) has muted (?:\[.+?\] )?(?<mutedUser>.+) for (?<duration>.+?)$/
    );

    if (match) {
        response.found = true;
        response.parts.staff = match.groups.username;
        response.parts.nick = match.groups.mutedUser;
        response.parts.duration = match.groups.duration;
    }
    return response;
}

function userUnmute(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { staff: null, nick: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('has unmuted') || msg.includes('guild chat')) return response;

    const match = msg.match(/^(?:\[.+?\] )?(?<username>.+) has unmuted (?:\[.+?\] )?(?<unmutedUser>.+?)$/);

    if (match) {
        response.found = true;
        response.parts.staff = match.groups.username;
        response.parts.nick = match.groups.unmutedUser;
    }
    return response;
}

function alreadyMuted(message) {
    const msg = cleanMessage(message);
    let response = { found: false };

    if (msg.includes(':')) return response;
    if (msg.includes('This player is already muted!')) {
        response.found = true;
    }
    return response;
}

function muteIsTooLong(message) {
    const msg = cleanMessage(message);
    let response = { found: false };

    if (msg.includes(':')) return response;
    if (msg.includes('You cannot mute someone for more than one month')) {
        response.found = true;
    }
    return response;
}

/**
 * Messages related to ranks:
 */

function guildPromotion(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null, oldRank: null, newRank: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('was promoted from')) return response;

    const match = msg.match(/^(?:\[.+?\] )?(?<username>.+) was promoted from (?<oldRank>.+) to (?<newRank>.+?)$/);

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
        response.parts.oldRank = match.groups.oldRank;
        response.parts.newRank = match.groups.newRank;
    }
    return response;
}

function guildDemotion(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null, oldRank: null, newRank: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('was demoted from')) return response;

    const match = msg.match(/^(?:\[.+?\] )?(?<username>.+) was demoted from (?<oldRank>.+) to (?<newRank>.+?)$/);

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
        response.parts.oldRank = match.groups.oldRank;
        response.parts.newRank = match.groups.newRank;
    }
    return response;
}

function rankNotFound(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { rank: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes(`I couldn't find a rank by the name of`)) return response;

    const match = msg.match(/I couldn't find a rank by the name of '(?<rank>.+)'!/);

    if (match) {
        response.found = true;
        response.parts.rank = match.groups.rank;
    }
    return response;
}

function alreadyLowestRank(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes(`the lowest rank you've created!`)) return response;

    const match = msg.match(/^(?:\[.+?\] )?(?<username>.+) is already the lowest rank you've created!/);

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
    }
    return response;
}

function alreadySameRank(message) {
    const msg = cleanMessage(message);
    let response = { found: false };

    if (msg.includes(':')) return response;
    if (msg.includes(`They already have that rank!`)) {
        response.found = true;
    }
    return response;
}

/**
 * Messages related to being in the guild:
 */

function guildJoinRequest(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('has requested to join the Guild!')) return response;

    const match = msg.match(/^(?:\[.+?\] )?(?<username>.+) has requested to join the Guild!/);

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
    }
    return response;
}

function guildJoin(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('joined the guild!')) return response;

    const match = msg.match(/^(?:\[.+?\] )?(?<username>.+) joined the guild!$/);

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
    }
    return response;
}

function guildLeave(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('left the guild!')) return response;

    const match = msg.match(/^(?:\[.+?\] )?(?<username>.+) left the guild!$/);

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
    }
    return response;
}

function guildKick(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null, staff: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('was kicked from the guild by')) return response;

    const match = msg.match(
        /^(?:\[.+?\] )?(?<username>.+) was kicked from the guild by (?:\[.+?\] )?(?<kicker>.+?)!?$/
    );

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
        response.parts.staff = match.groups.kicker;
    }
    return response;
}

function onlineInvite(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('You invited') || !msg.includes('to your guild. They have 5 minutes to accept.')) return response;

    const match = msg.match(
        /^You invited (?:\[.+?\] )?(?<username>.+) to your guild\. They have 5 minutes to accept\.$/
    );

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
    }
    return response;
}

function offlineInvite(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null } };

    if (msg.includes(':')) return response;
    if (
        !msg.includes('You sent an offline invite to') ||
        !msg.includes('They will have 5 minutes to accept once they come online!')
    )
        return response;

    const match = msg.match(
        /^You sent an offline invite to (?:\[.+?\] )?(?<username>.+?)! They will have 5 minutes to accept once they come online!$/
    );

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
    }
    return response;
}

function inviteError(message) {
    const msg = cleanMessage(message);
    let response = { found: false };

    if (msg.includes(':')) return response;

    const errorMessages = [
        'is already in another guild!',
        'You cannot invite this player to your guild!',
        "You've already invited",
        'is already in your guild!'
    ];

    if (errorMessages.some((m) => msg.includes(m))) {
        response.found = true;
    }
    return response;
}

/**
 * Messages related to usual guild events:
 */

function playerLogin(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null } };

    if (msg.includes(':')) return response;
    if (!msg.startsWith('Guild >') || !msg.endsWith('joined.')) return response;

    const match = msg.match(/^Guild > (?:\[.+?\] )?(?<username>.+) joined\.$/);

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
    }
    return response;
}

function playerLogout(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null } };

    if (msg.includes(':')) return response;
    if (!msg.startsWith('Guild >') || !msg.endsWith('left.')) return response;

    const match = msg.match(/^Guild > (?:\[.+?\] )?(?<username>.+) left\.$/);

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
    }
    return response;
}

function questCompletion(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { tier: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('GUILD QUEST TIER ') || !msg.includes('COMPLETED')) return response;

    const match = msg.match(/^GUILD QUEST TIER (?<tier>.+) COMPLETED!$/);

    if (match) {
        response.found = true;
        response.parts.tier = match.groups.tier;
    }
    return response;
}

function levelUp(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { level: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes('The guild has reached Level')) return response;

    const match = msg.match(/^The guild has reached Level (?<level>.+?)!$/);

    if (match) {
        response.found = true;
        response.parts.level = match.groups.level;
    }
    return response;
}




function repeatMessage(message) {
    const msg = cleanMessage(message);
    let response = { found: false };

    if (msg === 'You cannot say the same message twice!') {
        response.found = true;
    }
    return response;
}

function noPermission(message) {
    const msg = cleanMessage(message);
    let response = { found: false };

    if (msg.includes(':')) return response;

    const noPermMessages = [
        'You must be the Guild Master to use that command!',
        'You do not have permission to use this command!',
        "I'm sorry, but you do not have permission to perform this command.",
        'You cannot mute a guild member with a higher guild rank!',
        'You cannot kick this player!',
        'You can only promote up to your own rank!',
        'You cannot mute yourself from the guild!',
        "is the guild master so can't be demoted!",
        "is the guild master so can't be promoted anymore!",
        'You do not have permission to kick people from the guild!'
    ];

    if (noPermMessages.some((m) => msg.includes(m))) {
        response.found = true;
    }
    return response;
}

function incorrectUsage(message) {
    const msg = cleanMessage(message);
    let response = { found: false };

    if (msg.includes(':')) return response;
    if (!msg.includes('Invalid usage!')) return response;

    const match = msg.match(/^Invalid usage! '(?<usage>.+)'$/);

    if (match) {
        response.found = true;
    }
    return response;
}

function playerNotFound(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null } };

    if (!msg.startsWith("Can't find a player by the name of")) return response;

    const match = msg.match(/^Can't find a player by the name of '(?<username>.+)'$/);

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
    }
    return response;
}

function notInGuild(message) {
    const msg = cleanMessage(message);
    let response = { found: false, parts: { nick: null } };

    if (msg.includes(':')) return response;
    if (!msg.includes(' is not in your guild!')) return response;

    const match = msg.match(/^(?:\[.+?\] )?(?<username>.+) is not in your guild!$/);

    if (match) {
        response.found = true;
        response.parts.nick = match.groups.username;
    }
    return response;
}

module.exports = {
    // Related to mutes:
    guildMute,
    guildUnmute,
    userMute,
    userUnmute,
    alreadyMuted,
    muteIsTooLong,
    // Related to ranks:
    guildPromotion,
    guildDemotion,
    rankNotFound,
    alreadyLowestRank,
    alreadySameRank,
    // Related to being in the guild:
    guildJoinRequest,
    guildJoin,
    guildLeave,
    guildKick,
    onlineInvite,
    offlineInvite,
    inviteError,
    // Related to usual guild events:
    playerLogin,
    playerLogout,
    questCompletion,
    levelUp,
    // Error Messages
    repeatMessage,
    noPermission,
    incorrectUsage,
    playerNotFound,
    notInGuild
};
