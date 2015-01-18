#!/bin/sh

## Nourriture deployment script.

ssh ubuntu@localhost <<EOF
 export LC_CTYPE="en_US.UTF-8"
 cd nourriture_prod
 git pull
 cd bin
 sudo ./mongodb_install.sh
 sudo ./node_install.sh
 ./mongodb_launch.sh
 ./nourriture_server_launch.sh
 exit
 EOF

exit 0
