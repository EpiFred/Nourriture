#!/bin/sh

## Script to restart Nourriture Node server
## Must be launched from <Nourriture>/bin

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    MODE=dev
else
    MODE=prod
fi

UID=nourriture_front_$MODE
PIDFILE=$UID.pid

ssh ubuntu@localhost <<EOF
 export LC_CTYPE="en_US.UTF-8"
 rm -rf ".forever/pids/$PIDFILE"
 cd nourriture_$MODE/source/web
 npm install forever
 ./node_modules/forever/bin/forever stop --uid "$UID" app.js
 cd ../../bin
 ./nourriture_front_launch.sh $MODE
 exit
EOF
