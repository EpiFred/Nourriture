#!/bin/sh

## Script to launch Nourriture Node server on linux using forever.

cd ../source/server

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    UID=nourriture_dev
    npm install
    BINARY=dev
else
    UID=nourriture_prod
    npm install --production
    BINARY=prod
fi

PIDFILE=$UID.pid

if ! [ -e "$HOME/.forever/pids/$PIDFILE" ]; then
    npm install forever
    ./node_modules/forever/bin/forever start -p ./ -l forever.log -o output.log -e error.log --uid "$UID" --append bin/$BINARY
else
    ./node_modules/forever/bin/forever restart "$UID"
fi
