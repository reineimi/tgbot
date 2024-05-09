# Installing Node.js and Grammy
read -p '>> Installation path (ex: "$root"/): ' root;
read -p '>> Skip installation process? (Y/n): ' skip;
if [ "$skip" == 'n' ]; then
	# Updating database and installing NodeJS
	cd; echo 'Testing for Arch Linux...';
	sudo pacman -Syy nodejs npm;

	echo 'Testing for Termux...';
	pkg upgrade;
	pkg install nodejs;

	# Installing GrammyJS and setting up local path
	echo 'Installing grammy.js...';
	mkdir -p "$root";
	npm install --prefix "$root" grammy;
	sed -i 's/  }/  },\n  "type": "module"/' "$root"/package.json;
	echo "alias tgbot='clear; node ""$root""/tgbot.js';" >> ~/.bashrc;
	echo "alias tgbot='clear; node ""$root""/tgbot.js';" >> /data/data/com.termux/files/usr/etc/bash.bashrc;

	# Generating [conf.json] file
	read -p '>> (REQUIRED) Telegram bot token: ' bot_token;
	read -p '>> (OPTIONAL) Your GitHub username: ' gh_user;
	read -p '>> (OPTIONAL) Your GitHub repo: ' gh_repo;
	read -p '>> (OPTIONAL) Local HOME path (ex: Docs/MyBot): ' local_path;
	read -p '>> Prefer local path over GitHub? (true/false): ' is_local;
	read -p '>> Enable commands menu? (true/false): ' cmd_menu;
	read -p '>> Enable keywords menu? (true/false): ' kwd_menu;
	touch "$root"/conf.json;
echo '{
	"bot_token": "'"$bot_token"'",
	"github": "'"$gh_user"'/'"$gh_repo"'",
	"localFiles": '"$is_local"',
	"localPath": "'"$local_path"'",
	"commandsMenu": '"$cmd_menu"',
	"keywordsMenu": '"$kwd_menu"',
}' >> "$root"/conf.json;
fi

# Making and running the bot
echo '\nRetrieving/updating the bot...';
curl -o "$root"/tgbot.js https://raw.githubusercontent.com/reineimi/tgbot/main/tgbot.js;

echo 'Running the bot...';
node "$root"/tgbot.js;
rm -f tgbot_ei;
