#!/bin/sh

## Script to launch Nourriture Mongodb on linux.
## Must be launched from <Nourriture>/bin

CURRENT_BIN_PATH=`pwd`
DB_PATH=$CURRENT_BIN_PATH/../source/server/db

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    MODE=dev
else
    MODE=prod
fi

mongod --shutdown --dbpath $DB_PATH/data
rm -rf $DB_PATH/mongodb.pid
if ! ./mongodb_launch.sh; then
    echo "Mongodb launching has failed."
    exit 1
fi

exit 0
