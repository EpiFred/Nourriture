#!/bin/sh

ssh ubuntu@localhost <<EOF
cd nourriture_prod
git pull
cd bin
sudo ./node_install.sh
sudo ./mongodb_install.sh
sudo ./mongodb_launch.sh
exit
EOF

## TODO: Handle server launch

exit 0
