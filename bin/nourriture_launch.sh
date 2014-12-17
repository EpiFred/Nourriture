#!/bin/sh

## Script to launch Nourriture Node server with on linux using forever.

cd ../source/server

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    UID=nourriture_dev
    npm install
else
    UID=nourriture_prod
    npm install --production
fi

PIDFILE=$UID.pid

if ! [ -e "$HOME/.forever/pids/$PIDFILE" ]; then
    npm install forever
    ./node_modules/forever/bin/forever start -p ./ -l forever.log -o output.log -e error.log --uid "$UID" bin/dev
else
    ./node_modules/forever/bin/forever restart "$UID"
fi
