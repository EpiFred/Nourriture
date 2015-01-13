#!/bin/sh

## Mongodb uninstaller script for linux.

MONGO_DB_DIR=/var/mongodb

find /usr/local/sbin -lname '$MONGO_DB_DIRECTORY/bin/*' -delete
rm -rf $MONGO_DB_DIR
