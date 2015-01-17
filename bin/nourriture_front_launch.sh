#!/bin/sh

## Script to launch Nourriture Node/AngularJS front-end on linux using forever.

cd ../source/web

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    UID=nourriture_front_dev
    npm install
    BINARY=dev
else
    UID=nourriture_front_prod
    npm install --production
    BINARY=prod
fi

PIDFILE=$UID.pid

if ! [ -e "$HOME/.forever/pids/$PIDFILE" ]; then
    npm install forever
    ./node_modules/forever/bin/forever start -p ./ -l forever.log -o output.log -e error.log --uid "$UID" --append app.js
else
    ./node_modules/forever/bin/forever restart "$UID"
fi
