#!/bin/sh

## Mongodb launch script.

CURRENT_BIN_PATH=`pwd`
DB_PATH=$CURRENT_BIN_PATH/../source/server/db

if ! [ -e $DB_PATH/mongodb.pid ]; then
    if ! [ -d $DB_PATH/data ]; then
	mkdir $DB_PATH/data
    fi
    if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
	CONFIG=mongodb_dev.conf
    else
	CONFIG=mongodb_prod.conf
    fi
    if ! mongod --config $DB_PATH/$CONFIG --logpath $DB_PATH/mongodb.log --dbpath $DB_PATH/data --pidfilepath $DB_PATH/mongodb.pid; then
	rm -f $DB_PATH/mongodb.pid
    fi
fi
