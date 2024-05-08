cd; echo 'Testing for Arch Linux...';
sudo pacman -Syy nodejs npm;

echo 'Testing for Termux...';
pkg upgrade;
pkg install nodejs;

echo 'Installing grammy.js...';
mkdir .tgbot;
npm install --prefix ~/.tgbot grammy;
sed -i 's/  }/  },\n  "type": "module"/' ~/.tgbot/package.json;

echo 'Retrieving the bot...';
curl -LO https://raw.githubusercontent.com/reineimi/tgbot/main/tgbot.js;
echo "alias tgbot='node ~/.tgbot/tgbot.js';" >> ~/.bashrc;

echo 'Running the bot...';
node ~/.tgbot/tgbot.js;
rm -f tgbot_ei;
