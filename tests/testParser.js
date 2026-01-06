const parser = require("#shared/ParseHypixelMessage.js");
let chalk = require("chalk");

let tests = [
    {
        parser: parser.guildJoinRequest,
        message: "--------------\n[MVP++] Person has requested to join the Guild!\nClick here to accept...\n--------------",
        values: {
            nick: "Person"
        }
    },
    {
        parser: parser.guildJoin,
        message: "[MVP++] Person joined the guild!",
        values: {
            nick: "Person"
        }
    },
    {
        parser: parser.guildLeave,
        message: "[MVP++] Person left the guild!",
        values: {
            nick: "Person"
        }
    },
    {
        parser: parser.guildKick,
        message: "[MVP+] Person was kicked from the guild by [MVP+] Staff!",
        values: {
            nick: "Person",
            staff: "Staff"
        }
    },
    {
        parser: parser.guildPromotion,
        message: "[MVP+] Person was promoted from OldRank to NewRank",
        values: {
            nick: "Person",
            oldRank: "OldRank",
            newRank: "NewRank",
        }
    },
    {
        parser: parser.guildDemotion,
        message: "[MVP+] Person was demoted from OldRank to NewRank",
        values: {
            nick: "Person",
            oldRank: "OldRank",
            newRank: "NewRank",
        }
    },
    {
        parser: parser.playerLogin,
        message: "Guild > Person joined.",
        values: {
            nick: "Person",
        }
    },
    {
        parser: parser.playerLogout,
        message: "Guild > Person left.",
        values: {
            nick: "Person",
        }
    },
    {
        parser: parser.guildMute,
        message: "[MVP+] Staff has muted the guild chat for 1m",
        values: {
            staff: "Staff",
            duration: "1m"
        }
    },
    {
        parser: parser.guildUnmute,
        message: "[MVP+] Staff has unmuted the guild chat!",
        values: {
            staff: "Staff"
        }
    },
    {
        parser: parser.userMute,
        message: "[MVP+] Staff has muted [MVP+] Person for 1m",
        values: {
            nick: "Person",
            staff: "Staff",
            duration: "1m"
        }
    },
    {
        parser: parser.userUnmute,
        message: "[MVP+] Staff has unmuted [MVP+] Person",
        values: {
            nick: "Person",
            staff: "Staff"
        }
    },
    {
        parser: parser.onlineInvite,
        message: "You invited [MVP+] Person to your guild. They have 5 minutes to accept.",
        values: {
            nick: "Person"
        }
    },
    {
        parser: parser.offlineInvite,
        message: "You sent an offline invite to [VIP+] Person! They will have 5 minutes to accept once they come online!",
        values: {
            nick: "Person"
        }
    },
    {
        parser: parser.questCompletion,
        message: "GUILD QUEST TIER 1 COMPLETED!",
        values: {
            tier: "1"
        }
    },
    {
        parser: parser.levelUp,
        message: "The guild has reached Level 100!",
        values: {
            level: "100"
        }
    },
    {
        parser: parser.repeatMessage,
        message: "You cannot say the same message twice!",
        values: {}
    },
    {
        parser: parser.noPermission,
        message: "You must be the Guild Master to use that command!",
        values: {}
    },
    {
        parser: parser.noPermission,
        message: "I'm sorry, but you do not have permission to perform this command. Please contact the server administrators if you believe that this is an error.",
        values: {}
    },
    {
        parser: parser.incorrectUsage,
        message: "Invalid usage! '/guild mute <player/everyone> <time>'",
        values: {}
    },
    {
        parser: parser.playerNotFound,
        message: "Can't find a player by the name of 'Person'",
        values: {
            nick: "Person"
        }
    },
    {
        parser: parser.notInGuild,
        message: "[MVP+] Person is not in your guild!",
        values: {
            nick: "Person"
        }
    },
    {
        parser: parser.notInGuild,
        message: "[MVP+] Person is not in your guild!",
        values: {
            nick: "Person"
        }
    },
    {
        parser: parser.alreadyMuted,
        message: "This player is already muted!",
        values: {}
    },
    {
        parser: parser.cannotMuteMoreThanOneMonth,
        message: "You cannot mute someone for more than one month",
        values: {}
    },
    {
        parser: parser.inviteError,
        message: "[MVP+] PChallenges is already in another guild!",
        values: {}
    },
];

let total = 0;
let success = 0;
let fails = 0;

for (const test of tests) {
    total++;
    let parser = test.parser;
    let response = parser(test.message);

    if (!response.found) {
        console.log(`${chalk.bgRedBright(` Fail `)} ${chalk.redBright(`Method ${parser.name} did not find a match.`)} ${chalk.redBright(`${total}/${tests.length}`)}`);
        console.log(test);
        fails++;
        continue;
    }

    for (const [name, value] of Object.entries(test.values)) {
        if (response?.parts?.[name] != value) {
            console.log(`${chalk.bgRedBright(` Fail `)} ${chalk.redBright(`Method ${parser.name} returned a wrong value.`)} ${chalk.redBright(`${total}/${tests.length}`)}`);
            console.log("Expected:", test.values);
            console.log("Returned:", response?.parts);
            fails++;
            continue;
        }
    }

    if (Object.entries(response?.parts ?? {}).length != Object.entries(test.values).length) {
        console.log(`${chalk.bgRedBright(` Fail `)} ${chalk.redBright(`Method ${parser.name} returned a wrong set of values.`)} ${chalk.redBright(`${total}/${tests.length}`)}`);
        console.log("Expected:", test.values);
        console.log("Returned:", response?.parts);
        fails++;
        continue;
    }

    console.log(`${chalk.bgGreenBright(` Pass `)} ${chalk.greenBright(`Method ${parser.name} passed the test.`)} ${chalk.greenBright(`${total}/${tests.length}`)}`);
    success++;
}

console.log();

console.log(`Ran ${total} tests (${tests.length} packs).`);
console.log(`${fails} tests failed.`);
console.log(`${success} tests passed.`);