#!/bin/sh

ssh ubuntu@localhost <<EOF
cd nourriture_prod
git pull
sudo ./bin/node_install.sh
sudo ./bin/mongodb_install.sh
sudo ./bin/mongodb_launch.sh
exit
EOF

## TODO: Handle server launch

exit 0
