#!/bin/sh

ssh ubuntu@localhost <<EOF
 export LC_CTYPE="en_US.UTF-8"
 cd nourriture_dev
 git pull origin develop
 cd bin
 sudo ./mongodb_install.sh
 sudo ./node_install.sh
 ./mongodb_launch.sh dev
 ./nourriture_launch.sh dev
 ps -e | grep mongodb
 ps -e | grep node
 exit
 EOF

exit 0
