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
const bot_token = null;
const bot = new Bot(bot_token);
const commands = [];
const keywords = [];
const settings = {
	github: null,
	commandsMenu: false,
	keywordsMenu: true,
};
let URL = '';

if (!bot_token) {
	console.log('\n[!] Please set [bot_token] parameter');
	process.exit();
}

if (settings.github) {
	console.log(`\nGitHub repo: https://github.com/${settings.github}\n`);
	URL = `https://raw.githubusercontent.com/${settings.github}/main/`;
} else {
	console.log('\n[!] Please set [settings.github] parameter');
	process.exit();
}

// Load "settings.json" or use default
try {
	await fetch (`${URL}settings.json`)
	.then(r_file => r_file.json())
	.then(data => {
		console.log('\nSettings: ', data);
		for (const [i, v] of Object.entries(data)) {
			settings[i] = v;
		}
	});
} catch (err) {
	console.log('\n[!] File "settings.json" not found; falling back to default settings');
}

// Create a new command
async function cmd_new(name) {
	try {
		await fetch (URL+`${name}.md`)
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
		console.log(`[!] File "${name}.md" not found`);
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
			await ctx.replyWithPhoto(new InputFile({ url: xURL }));
		});
	} catch(err) {
		console.log(`[!] File "${keyword_filename}" not found`);
	}
}

// Get a list of commands
try {
	await fetch (`${URL}commands.json`)
	.then(r_file => r_file.json())
	.then(data => {
		console.log('\nCommands: ', data);
		for (const [i, v] of Object.entries(data)) {
			commands.push({
				command: i,
				description: v
			});
			cmd_new(i);
		}
	});
} catch (err) {
	console.log(`\n[!] File "${URL}commands.json" not found`);
	console.log('Traceback: '+err);
}

// Get a list of keywords
try {
	await fetch (`${URL}keywords.json`)
	.then(r_file => r_file.json())
	.then(data => {
		console.log('\nKeywords: ', data);
		for (const [i, v] of Object.entries(data)) {
			keywords.push(i);
			kwd_new(i, v);
		}
	});
} catch (err) {
	console.log(`\n[!] File "${URL}keywords.json" not found`);
	console.log('Traceback: '+err);
}

if (settings.commandsMenu) {
	await bot.api.setMyCommands(commands);
}
let keyboard;
if (settings.keywordsMenu) {
	let buttonRows = keywords.map((keyword) => [Keyboard.text(keyword)]);
	keyboard = Keyboard.from(buttonRows).resized();
}
bot.start();
