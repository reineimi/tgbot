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
"use strict";
import { Bot, Context, InputFile, Keyboard } from 'grammy';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const path = require('path');
const fs = require('node:fs');
let conf; try {
	conf = require("./conf.json");
} catch {
	console.log('\n[!] Please add [conf.json] file to your project\n');
	process.exit();
}
console.log('[i] Current Working Directory path: ', process.cwd(), '\n');
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
	dev_chat_id: conf.dev_chat_id,
	github: conf.github,
	commandsMenu: conf.commandsMenu,
	keywordsMenu: conf.keywordsMenu,
	localFiles: conf.localFiles,
	localPath: conf.localPath,
};
let URL = '';

// Utility functions
function date() {
	let now = new Date()
	let mm = now.getMonth()+1
	let dd = now.getDate()
	let h = now.getHours()
	let m = now.getMinutes()
	let s = now.getSeconds()
	if (mm.toString().length==1) {mm = '0'+mm}
	if (dd.toString().length==1) {dd = '0'+dd}
	if (h.toString().length==1) {h = '0'+h}
	if (m.toString().length==1) {m = '0'+m}
	if (s.toString().length==1) {s = '0'+s}
	return `${mm}-${dd} ${h}:${m}:${s}`
}
function log(ctx_msg) {
	console.log(
`-- ${date()} --
| in: ${ctx_msg.chat.id}
| from: ${ctx_msg.from.id}
| username: ${ctx_msg.from.username}
| message: ${ctx_msg.text}
-- -- -- -- -- -- --
`);
}
async function msg(ctx, text, isMd, noLog) {
	const data = {
		chat_id: ctx.msg.chat.id,
		text: text,
		reply_markup: keyboard,
	}
	if (isMd) {
		data.parse_mode = 'Markdown'
	}
	await bot.api.raw.sendMessage(data);
	if (!noLog) { log(ctx.msg); }
}

// Set URL to local dir or GitHub repo
if (settings.github && (settings.github !== '') && (settings.github !== '/') && (!settings.localFiles)) {
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
			.then(text => {
				bot.command(name, async (ctx) => {
					msg(ctx, text, 1);
				});
			});
		} catch(err) {
			console.log(`[!] Command file "${name}.md" not found\n`);
		}
	} else {
		fs.readFile(`${URL+name}.md`, 'utf8', (err, text) => {
			if (err) {
				console.log(`[!] Command file "${name}.md" not found\n`);
				return;
			}
			bot.command(name, async (ctx) => {
				msg(ctx, text, 1);
			});
		});
	}
}

// Create a new keyword
async function kwd_new(phrase, file_URL) {
	// Text file part
	let filedata, fURL;
	if (file_URL.match(/http[s]?:\/\//gm)) {
		fURL = file_URL.replace(/\.[^.]*$/gm, '.md');
	} else {
		fURL = URL + file_URL.replace(/\.[^.]*$/gm, '.md').match(/[^/]*$/gm)[0];
	}

	if (!settings.localFiles) {
		try {
			await fetch (fURL)
			.then(r_file => r_file.text())
			.then(text => { filedata = text; });
		} catch(err) {
			console.log(`[!] Keyword file "${fURL}" not found\n`);
		}
	} else {
		fs.readFile(fURL, 'utf8', (err, text) => {
			if (err) {
				console.log(`[!] Keyword file "${fURL}" not found\n`);
				return;
			}
			filedata = text;
		});
	}

	// Image file part
	let xURL;
	if (file_URL.match(/http[s]?:\/\//gm)) {
		xURL = file_URL;
	} else {
		xURL = URL + file_URL;
	}

	bot.hears(phrase, async (ctx) => {
		if (filedata) { await msg(ctx, filedata, 1, 1); }
		if (!settings.localFiles) {
			try {
				await ctx.replyWithPhoto(new InputFile({ url: xURL }), { reply_markup: keyboard });
			} catch {
				console.log(`[!] File "${xURL}" not found\n`);
			}
		} else {
			try {
				await ctx.replyWithPhoto(new InputFile(xURL), { reply_markup: keyboard });
			} catch {
				console.log(`[!] File "${xURL}" not found\n`);
			}
		}
		log(ctx.msg);
	});
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

// Set visibility of the menus
if (settings.commandsMenu && (settings.commandsMenu !== '') && (commands.length > 0)) {
	await bot.api.setMyCommands(commands);
}
let keyboard = {};
if (settings.keywordsMenu && (settings.keywordsMenu !== '') && (keywords.length > 0)) {
	let buttonRows = keywords.map((keyword) => [Keyboard.text(keyword)]);
	keyboard = Keyboard.from(buttonRows).resized();
}

// Get {dev_chat_id}
bot.command('getid', async (ctx) => {
	msg(ctx, `"dev_chat_id": "${ctx.msg.chat.id}"`);
});

// Run inline JS for {dev_chat_id}
bot.command("js", async (ctx) => {
	let res;
	if (ctx.msg.chat.id.toString() === settings.dev_chat_id) {
		try {
			let str = ctx.msg.text.substring(3, ctx.msg.text.length);
			res = eval(str).toString();
		} catch(err) {
			res = err;
		}
		msg(ctx, `js:: ${res}`);
	} else {
		msg(ctx, 'Not a privileged user.');
	}
});

bot.start();
