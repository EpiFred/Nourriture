#!/bin/sh

## Script to clean Nourriture Node server so it can start properly

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    UID=nourriture_dev
else
    UID=nourriture_prod
fi

PIDFILE=$UID.pid

rm -rf "$HOME/.forever/pids/$PIDFILE"
