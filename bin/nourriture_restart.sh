#!/bin/sh

## Script to restart Nourriture Node server
## Must be launch from <Nourriture>/bin

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    MODE=dev
else
    MODE=prod
fi

UID=nourriture_$MODE
PIDFILE=$UID.pid

../source/server/node_modules/forever/bin/forever stop --uid "$UID"
rm -rf "$HOME/.forever/pids/$PIDFILE"
./nourriture_launch.sh $MODE
