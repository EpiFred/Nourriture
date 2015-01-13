#!/bin/sh

## Script to restart Nourriture Node server
## Must be launched from <Nourriture>/bin

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    MODE=dev
else
    MODE=prod
fi

UID=nourriture_$MODE
PIDFILE=$UID.pid

ssh ubuntu@localhost <<EOF
 export LC_CTYPE="en_US.UTF-8"
 cd nourriture_$MODE/source/server
 ./node_modules/forever/bin/forever stop --uid "$UID" bin/$MODE
 cd ../../bin
 rm -rf "~/.forever/pids/$PIDFILE"
 ./mongodb_restart.sh $MODE
 ./nourriture_launch.sh $MODE
 exit
EOF
