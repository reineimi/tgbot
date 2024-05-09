/* Telegram Bot, written by @reineimi (https://github.com/reineimi)
Configs:
	settings.json:
		{ "param": arg, ... }

	commands.json:
		{ "name": "description", ... }

	keywords.json:
		{ "phrase": "file_URL", ... }

Sources:
	Command file:
		{command_name}.md

	Keyword file:
		{filename or URL} (with extension)

(All of the files must be in the main directory/repo)
*/
import { Bot, Context, InputFile, Keyboard } from 'grammy';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const path = require('path');
let conf; try {
	conf = require("./conf.json");
} catch {
	console.log('\n[!] Please add [conf.json] file to your project\n');
	process.exit();
}
console.log('[i] Configuration:', conf, '\n');
let bot_token = conf.bot_token;
if (!bot_token) {
	console.log('\n[!] Please set [bot_token] parameter\n');
	process.exit();
}
const bot = new Bot(bot_token);
const commands = [];
const keywords = [];
const settings = {
	github: conf.github,
	commandsMenu: conf.commandsMenu,
	keywordsMenu: conf.keywordsMenu,
	localFiles: conf.localFiles,
	localPath: conf.localPath,
};
let URL = '';

// Set URL to local dir or GitHub repo
if (settings.github && (settings.github !== '/') && (!settings.localFiles)) {
	settings.github = settings.github.replaceAll(' ', '/');
	console.log(`[i] GitHub repo: https://github.com/${settings.github}\n`);
	URL = `https://raw.githubusercontent.com/${settings.github}/main/`;
} else {
	settings.localFiles = true;
	if (settings.localPath) {
		URL = path.join(process.cwd(), settings.localPath+'/');
	} else {
		URL = path.join(process.cwd(), '.tgbot/files/');
	}
	console.log(`[i] GitHub information is not set. Using local directory: ${URL}\n`);
}

// Create a new command
async function cmd_new(name) {
	if (!settings.localFiles) {
		try {
			await fetch (`${URL+name}.md`)
			.then(r_file => r_file.text())
			.then(data => {
				bot.command(name, async (ctx) => {
					await bot.api.raw.sendMessage({
						chat_id: ctx.msg.chat.id,
						text: data,
						parse_mode: "Markdown",
						reply_markup: keyboard || {},
					});
				});
			});
		} catch(err) {
			console.log(`[!] File "${name}.md" not found\n`);
		}
	} else {
		try {
			let data = require(`${URL+name}.json`);
			bot.command(name, async (ctx) => {
				await bot.api.raw.sendMessage({
					chat_id: ctx.msg.chat.id,
					text: data[0],
					parse_mode: "Markdown",
					reply_markup: keyboard,
				});
			});
		} catch(err) {
			console.log(`[!] File "${name}.json" not found\n`);
		}
	}
}

// Create a new keyword
async function kwd_new(phrase, file_URL) {
	let xURL;
	if (file_URL.match(/http[s]?:\/\//gm)) {
		xURL = file_URL;
	} else {
		xURL = URL + file_URL;
	}

	try {
		bot.hears(phrase, async (ctx) => {
			if (!settings.localFiles) {
				await ctx.replyWithPhoto(new InputFile({ url: xURL }));
			} else {
				await ctx.replyWithPhoto(new InputFile(xURL));
			}
		});
	} catch(err) {
		console.log(`[!] File "${xURL}" not found\n`);
	}
}

// Get a list of commands
if (!settings.localFiles) {
	try {
		await fetch (`${URL}commands.json`)
		.then(r_file => r_file.json())
		.then(data => {
			console.log('[+] Commands: ', data, '\n');
			for (const [i, v] of Object.entries(data)) {
				commands.push({
					command: i,
					description: v
				});
				cmd_new(i);
			}
		});
	} catch (err) {
		console.log(`[!] File "${URL}commands.json" not found`);
		console.log('[>] Traceback: '+err+' [<]\n');
	}
} else {
	try {
		let data = require(`${URL}commands.json`);
		console.log('[+] Commands: ', data, '\n');
		for (const [i, v] of Object.entries(data)) {
			commands.push({
				command: i,
				description: v
			});
			cmd_new(i);
		}
	} catch (err) {
		console.log(`[!] File "${URL}commands.json" not found`);
		console.log('[>] Traceback: '+err+' [<]\n');
	}
}

// Get a list of keywords
if (!settings.localFiles) {
	try {
		await fetch (`${URL}keywords.json`)
		.then(r_file => r_file.json())
		.then(data => {
			console.log('[+] Keywords: ', data, '\n');
			for (const [i, v] of Object.entries(data)) {
				keywords.push(i);
				kwd_new(i, v);
			}
		});
	} catch (err) {
		console.log(`[!] File "${URL}keywords.json" not found`);
		console.log('[>] Traceback: '+err+' [<]\n');
	}
} else {
	try {
		let data = require(`${URL}keywords.json`);
		console.log('[+] Keywords: ', data, '\n');
		for (const [i, v] of Object.entries(data)) {
			keywords.push(i);
			kwd_new(i, v);
		}
	} catch(err) {
		console.log(`[!] File "${URL}keywords.json" not found`);
		console.log('[>] Traceback: '+err+' [<]\n');
	}
}

if (settings.commandsMenu && (settings.commandsMenu !== '') && (commands.length > 0)) {
	await bot.api.setMyCommands(commands);
}
let keyboard = {};
if (settings.keywordsMenu && (settings.keywordsMenu !== '') && (keywords.length > 0)) {
	let buttonRows = keywords.map((keyword) => [Keyboard.text(keyword)]);
	keyboard = Keyboard.from(buttonRows).resized();
}
bot.start();
