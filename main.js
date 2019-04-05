/**
    file: main.js
    version: 1.0.0
    description: The main code behind the battlemetrics discord bot to make requests and send them back to the user
    author: Justin Yau
    see: https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/
    see: https://discordjs.guide/preparations/#installing-discord-js
 */

var Discord = require('discord.js'); // npm install discord.js
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
                                    "\tServer Information: " + prefix + "server (serverID)");
            break;
        case 'prefix':
            prefix = args[0];
            message.channel.send("Prefix successfully changed to: " + prefix);
            break;
        default:
            message.channel.send("Command: " + command + " not recognized!");
    }
});