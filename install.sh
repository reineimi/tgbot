# Installing Node.js and Grammy
read -p '>> Skip installation process? (y/N): ' skip;
if [[ "$skip" != 'y' ]]; then 
	cd; echo 'Testing for Arch Linux...';
	sudo pacman -Syy nodejs npm;

	echo 'Testing for Termux...';
	pkg upgrade;
	pkg install nodejs;

	echo 'Installing grammy.js...';
	mkdir .tgbot;
	npm install --prefix ~/.tgbot grammy;
	sed -i 's/  }/  },\n  "type": "module"/' ~/.tgbot/package.json;
	echo "alias tgbot='clear; node ~/.tgbot/tgbot.js';" >> ~/.bashrc;
fi

# Reading bot token and github repo
readarray -t lines < <(cat ~/.tgbot/data.txt);
ln=0; bot_token=0; github=0;
for line in "${lines[@]}"; do
	((++ln));
	if [[ "$line" != 'No such file' ]]; then
		if [[ "$ln" == 1 ]]; then
			bot_token="$line";
		elif [[ "$ln" == 2 ]]; then
			github="$line";
		fi
	fi
done
if [[ "$ln" == 0 ]]; then
	read -p '>> Enter your Telegram bot token: ' bot_token;
	read -p '>> Enter your GitHub username: ' gh_user;
	read -p '>> Enter your GitHub repo for bot configs: ' gh_repo;
	github="$gh_user\/$gh_repo";
fi

# Making and running the bot
echo '\nRetrieving/updating the bot...';
curl -o ~/.tgbot/tgbot.js https://raw.githubusercontent.com/reineimi/tgbot/main/tgbot.js;

sed -i "s/bot_token = null/bot_token = '$bot_token'/" ~/.tgbot/tgbot.js;
sed -i "s/github: null/github: '$github'/" ~/.tgbot/tgbot.js;

echo 'Running the bot...';
node ~/.tgbot/tgbot.js;
rm -f tgbot_ei;
