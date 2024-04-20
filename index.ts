import {getPlayers, getRole, getRoles, type GroupUser, type PlayerInfo, type Role} from "noblox.js";
import * as fs from "fs";
import * as repl from "repl";
const argv: Cli = require('yargs-parser')(process.argv.slice(2))
if (argv.minRole == undefined || argv.group == undefined || argv.timeout == undefined) {
    throw Error("You must have all args min role, group, and timeout")
}
const groupId = argv.group


// @ts-ignore
function replacer(key, value) {
    if(value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    } else {
        return value;
    }
}

async function main() {
    let roles: Role[] = (await getRoles(groupId))
    //Cut out the guest and auto added role
    roles = roles.slice(1, roles.length - 1)

    //Map of data points
    let data: Map<number, GroupRole[]> = new Map();


    async function getData() {
        let groupRoles: GroupRole[] = []
        for (let i = roles.length - argv.minRole; i >= 0; i--) {
            let role = roles[i]
            let players = await getPlayers(groupId, role.id)
            groupRoles.push(new GroupRole(role.name, players, role.id))
        }
        data.set(Date.now(), groupRoles)
        fs.writeFile("./data.json", JSON.stringify(data, replacer), {}, () => {})
    }

    await getData()
    setTimeout(async () => await getData(), argv.timeout * 1000)
}

class GroupRole {
    constructor(private name: string, private members: GroupUser[], private id: number) {}
}

interface Cli {
    group: number,
    timeout: number,
    minRole: number
}

main().then(() => {})