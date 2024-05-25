mkdir -p ~/.config/systemd/user
cp -v tgbot.service ~/.config/systemd/user/;
systemctl enable --user --now tgbot.service;
systemctl start --user tgbot.service;
