#!/bin/sh

ssh ubuntu@localhost <<EOF
cd nourriture_prod
git pull
sudo ./bin/node_install.sh
exit
EOF

## TODO: Handle server launch

exit 0
