#!/bin/sh

## Nourriture deployment script.

ssh ubuntu@localhost <<EOF
cd nourriture_prod
git pull
cd bin
sudo ./node_install.sh
npm install --production
sudo ./mongodb_install.sh
./mongodb_launch.sh
./nourriture_launch.sh
exit
EOF

exit 0
