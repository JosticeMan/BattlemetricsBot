/**
    file: main.js
    version: 1.0.0
    description: The main code behind the battlemetrics discord bot to make requests and send them back to the user
    author: Justin Yau
    see: https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/
    see: https://discordjs.guide/preparations/#installing-discord-js
 */

var Discord = require('discord.js'); // npm install discord.js
var unirest = require('unirest');    // npm install unirest
var logger = require('winston');     // npm install winston
/**
   auth.json format:
    {
        "token": "insert token here"
    }
 */
var auth = require('./auth.json');   // touch auth.json -> vim auth.json
var prefix = '!';

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client();

bot.once('ready', function (evt) {
    logger.info('Connected!');
});

bot.login(auth.token);

bot.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();

    switch(command) {
        case 'help':
            message.channel.send("**Help Menu**:\n" +
                                    "\tPrefix: " + prefix + "\n" +
                                    "\tHelp Menu: " + prefix + "help\n" +
                                    "\tChange prefix: " + prefix + "prefix (newPrefix)\n" +
                                    "\tList: " + prefix + "list (query) \n" +
                                    "\tServer Information: " + prefix + "server (serverID)");
            break;
        case 'prefix':
            prefix = args[0];
            message.channel.send("Prefix successfully changed to: " + prefix);
            break;
        case 'list':
            var query = args[0];
            console.log("https://api.battlemetrics.com/servers?filter[search]=\"" + query + "\"");
            unirest.get("https://api.battlemetrics.com/servers?filter[search]=\"" + query + "\"")
                .end(function (result) {
                    var json = JSON.parse(JSON.stringify(result.body));
                    if(result.status != 200) {
                        message.reply("An error occurred while trying to make the API request!");
                    } else {
                        console.log(json);
                        var i = 1;
                        message.channel.send("**Server List for "  + query + "**:");
                        json.data.map(data => {
                            message.channel.send( "**Server #"  + i + "**:" + "\n" +
                                               "\tServer Name: " + data.attributes.name + "\n" +
                                                    "\tServer ID: " + data.id + "\n" +
                                                    "\tGame: " + data.relationships.game.data.id + "\n" +
                                                    "\tServer IP: " + data.attributes.ip + "\n" +
                                                    "\tPlayers: " + data.attributes.players + "\n" +
                                                    "\tMax Players: " + data.attributes.maxPlayers + "\n" +
                                                    "\tServer Rank: " + data.attributes.rank);
                            i = i + 1;
                        })
                    }
                });
            break;
        case 'server':
            var server_id = args[0];
            unirest.get("https://api.battlemetrics.com/servers/".concat(server_id))
                .end(function (result) {
                    //console.log(result.status, result.headers, result.body);
                    var json = JSON.parse(JSON.stringify(result.body));
                    if(result.status != 200) {
                        message.reply("An error occurred while trying to make the API request!");
                    } else {
                        message.channel.send("**Server Information**:\n" +
                                                "\tGame: " + json.data.relationships.game.data.id + "\n" +
                                                "\tServer id: " + json.data.id + "\n" +
                                                "\tServer name: " + json.data.attributes.name + "\n" +
                                                "\tServer IP: " + json.data.attributes.ip + "\n" +
                                                "\tOfficial: " + json.data.attributes.details.official + "\n" +
                                                "\tMap: " + json.data.attributes.details.map + "\n" +
                                                "\tPlayers: " + json.data.attributes.players + "\n" +
                                                "\tMax Players: " + json.data.attributes.maxPlayers + "\n" +
                                                "\tServer Rank: " + json.data.attributes.rank + "\n" +
                                                "\tPVE Enabled: " + json.data.attributes.details.pve + "\n" +
                                                "\tStatus: " + json.data.attributes.status + "\n");
                    }
                });
            break;
        default:
            message.channel.send("Command: " + command + " not recognized!");
    }
});