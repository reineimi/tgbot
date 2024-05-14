# Installing Node.js and Grammy
read -p '>> Skip installation process? (y/N): ' skip;
if [ "$skip" != 'y' ]; then
	# Updating database and installing NodeJS
	cd; echo 'Testing for Arch Linux...';
	sudo pacman -Syy nodejs npm;

	echo 'Testing for Termux...';
	pkg upgrade;
	pkg install nodejs;

	# Installing GrammyJS and setting up local path
	echo 'Installing grammy.js...';
	mkdir .tgbot;
	npm install --prefix ~/.tgbot grammy;
	sed -i 's/  }/  },\n  "type": "module"/' ~/.tgbot/package.json;
	echo "alias tgbot='clear; node ~/.tgbot/tgbot.js';" >> ~/.bashrc;
	echo "alias tgbot='clear; node ~/.tgbot/tgbot.js';" >> /data/data/com.termux/files/usr/etc/bash.bashrc;

	# Generating [conf.json] file
	read -p '>> (REQUIRED) Telegram bot token: ' bot_token;
	read -p '>> (OPTIONAL) Your PM chat id: ' pm_id;
	read -p '>> (OPTIONAL) Your GitHub username: ' gh_user;
	read -p '>> (OPTIONAL) Your GitHub repo: ' gh_repo;
	read -p '>> (OPTIONAL) Local HOME path (ex: Docs/MyBot): ' local_path;
	read -p '>> Prefer local path over GitHub? (true/false): ' is_local;
	read -p '>> Enable commands menu? (true/false): ' cmd_menu;
	read -p '>> Enable keywords menu? (true/false): ' kwd_menu;
	touch ~/.tgbot/conf.json;
echo '{
	"bot_token": "'"$bot_token"'",
	"dev_chat_id": "'"$pm_id"'",
	"github": "'"$gh_user"'/'"$gh_repo"'",
	"localFiles": '"$is_local"',
	"localPath": "'"$local_path"'",
	"commandsMenu": '"$cmd_menu"',
	"keywordsMenu": '"$kwd_menu"'
}' >> ~/.tgbot/conf.json;
fi

# Making and running the bot
echo '\nRetrieving/updating the bot...';
curl -o ~/.tgbot/tgbot.js https://raw.githubusercontent.com/reineimi/tgbot/main/tgbot.js;

echo 'Running the bot...';
node ~/.tgbot/tgbot.js;
rm -f tgbot_ei;
