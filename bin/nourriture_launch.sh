#!/bin/sh

## Script to launch Nourriture Node server with on linux using forever.

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    UID=nourriture_dev
else
    UID=nourriture_prod
fi

PIDFILE=$UID.pid

cd ../source/server

if ! [ -e "$HOME/.forever/pids/$PIDFILE" ]; then
    npm install forever
    ./node_modules/forever/bin/forever start -p ./ -l forever.log -o output.log -e error.log --uid "$UID" bin/dev
else
    ./node_modules/forever/bin/forever restart "$UID"
fi
