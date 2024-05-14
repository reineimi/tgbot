# Installation
Simply open Linux/Android (Termux) terminal and run:
```
curl -LO bit.ly/tgbot_ei; sh tgbot_ei
```
#
Or, manually:
## 1. Install Node.js
**Linux:** `nodejs` and `npm` packages

**Windows:** https://nodejs.org/en/download

**Android (Termux):**
```sh
pkg upgrade; pkg install nodejs
```

## 2. Install Grammy.js
Create a folder(s) in your preferred directory (let's call it `DIR`) and run:
```sh
npm install --prefix DIR grammy
```

## 3. Download tgbot.js
Download [tgbot.js](https://github.com/reineimi/tgbot/blob/main/tgbot.js) or clone/unzip the whole repo in the same `DIR`.

## 4. Configure the bot
In the same `DIR`, addd and/or modify `conf.json` as you need.

<hr>

# Files
## conf.json
Will be generated from `install.sh` or created manually. Contains:
```json
{
  "bot_token": "000:000",
  "dev_chat_id": "000",
  "github": "user/repo",
  "localFiles": true,
  "localPath": ".tgbot/files",
  "commandsMenu": false,
  "keywordsMenu": true
}
```
From which:
- `bot_token`: Your token generated by [BotFather](https://t.me/botfather)

- `dev_chat_id`: Your `chat id` received from `/start` command. Allows bot to execute JS from **your PM**.<br>
⚠️ Please use `chat id` **only** from **your private messages with the bot**

- `github`: Your GitHub username and repository, taken from:<br>
**https:// github.com /`user` /`repo`**

- `localFiles`: Use local home (`~/...`) subdirectory instead of GitHub repo?

- `localPath`: Home subdirectory path

- `commandsMenu`: A button with commands list in the chat

- `keywordsMenu`: A list of buttons beneath the chat

#
## commands.json
A list of commands with the following syntax:
```json
{
  "command": "description",
  "test": "A test"
}
```
> Note: Commands are `/command` actions with associated text documents.

Once you've added a command, create the corresponding `.md` document file in the same directory:<br>
`command.md` (example: `test.md`).

#
## keywords.json
A list of keywords (phrases) with the following syntax:
```json
{
  "keyword": "filename.extension",
  "A test": "example.jpg"
}
```
> Note: Keywords are buttons/phrases with associated images.

Same as with commands, we create corresponding files (ex: `example.jpg`) for every keyword.

<hr>

# Examples
You can take a look at examples in [this](https://github.com/reineimi/tgbot/tree/main/example) folder.
