/* Telegram Bot, written by @reineimi (https://github.com/reineimi)
Configs:
	settings.json:
		{ "param": arg, ... }

	commands.json:
		{ "name": "description", ... }

	keywords.json:
		{ "phrase": {...file_URLs}, ... }

Sources:
	Command file:
		{command_name}.md

	Keyword file:
		{filename or URL} (with extension)

(All of the files must be in the main directory/repo)
*/
"use strict";
import { Bot, Context, InputFile, InputMediaBuilder, Keyboard } from 'grammy';
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

async function msg(ctx, str, _isPath, _noLog) {
	const data = {
		chat_id: ctx.msg.chat.id,
		reply_markup: keyboard,
		parse_mode: 'Markdown'
	}

	if (_isPath) {
		let path = URL + str.match(/[^/]*$/gm)[0] + '.md';

		if (!settings.localFiles) {
			try {
				await fetch (path)
				.then(r_file => r_file.text())
				.then(text => {
					data.text = text;
					bot.api.raw.sendMessage(data);
				});
			} catch(err) {
				console.log(`[!] File "${path}" not found\n`);
			}
		} else {
			fs.readFile(path, 'utf8', (err, text) => {
				if (err) {
					console.log(`[!] File "${path}" not found\n`);
					return;
				}
				data.text = text;
				bot.api.raw.sendMessage(data);
			});
		}
	} else {
		data.text = str;
		bot.api.raw.sendMessage(data);
	}

	if (!_noLog) { log(ctx.msg); }
}

async function img(ctx, paths) {
	const media = [], capts = [], mediaGroup = [];
	let items = paths || [];

	// Parse paths
	for (const f of items) {
		// Get caption
		let tURL = URL + f.replace(/\.[^.]*$/gm, '.txt').match(/[^/]*$/gm)[0];
		if (!settings.localFiles) {
			try {
				await fetch (tURL)
				.then(r_file => r_file.text())
				.then(text => { capts.push(text); });
			} catch(err) {
				console.log(`[!] File "${tURL}" not found\n`);
			}
		} else {
			await new Promise((r) => {
				fs.readFile(tURL, 'utf8', (err, text) => {
					if (err) {
						console.log(`[!] File "${tURL}" not found\n`);
					}
					capts.push(text);
					r(1);
				});
			});
		}

		// Get image
		let iURL;
		if (f.match(/http[s]?:\/\//gm)) { iURL = f; }
		else { iURL = URL + f; }

		if (!settings.localFiles) {
			media.push(new InputFile({ url: iURL }));
		} else {
			media.push(new InputFile(iURL));
		}
	}

	// Parse files
	for (const v of media) {
		mediaGroup.push(InputMediaBuilder.photo(v, {
			caption: capts[media.indexOf(v)] || ''
		}));
	}
	if (mediaGroup.length > 0) {
		ctx.replyWithMediaGroup(mediaGroup, {reply_markup: keyboard});
	}
}

async function parsejson(fname, func) {
	if (!settings.localFiles) {
		try {
			await fetch (`${URL+fname}.json`)
			.then(r_file => r_file.json())
			.then(data => {
				console.log(`[+] ${fname}: `, data, '\n');
				for (const [i, v] of Object.entries(data)) {
					func(i, v);
				}
			});
		} catch (err) {
			console.log(`[!] File "${URL+fname}.json" not found`);
			console.log('[>] Traceback: '+err+' [<]\n');
		}
	} else {
		try {
			let data = require(`${URL+fname}.json`);
			console.log(`[+] ${fname}: `, data, '\n');
			for (const [i, v] of Object.entries(data)) {
				func(i, v);
			}
		} catch(err) {
			console.log(`[!] File "${URL+fname}.json" not found`);
			console.log('[>] Traceback: '+err+' [<]\n');
		}
	}
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
async function cmd_new(name, files) {
	bot.command(name, async (ctx) => {
		msg(ctx, name, 1);
		img(ctx, files);
	});
}

// Create a new keyword
async function kwd_new(phrase, files) {
	bot.hears(phrase, async (ctx) => {
		msg(ctx, phrase, 1);
		img(ctx, files);
		log(ctx.msg);
	});
}

// Get a list of commands
parsejson('commands', (i,v)=>{
	let info = v[0] || '';
	commands.push({ command: i, description: info });
	cmd_new(i, v[1]);
});

// Get a list of keywords
parsejson('keywords', (i,v)=>{
	keywords.push(i);
	kwd_new(i, v);
});

// Set visibility of the menus
if (settings.commandsMenu && (settings.commandsMenu !== '')) {
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
