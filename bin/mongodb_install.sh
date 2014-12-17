#!/bin/sh

# Mongodb install script for linux 64 bits kernel.
# It downloads, extracts and places files in "/var/mongodb/".

MONGO_DB_ARCHIVE="mongodb-linux-x86_64-2.6.6.tgz"
MONGO_DB_EXTRACTED_DIR="mongodb-linux-x86_64-2.6.6"
MONGO_DB_DIR="/var/mongodb"

if ! command -v mongod >/dev/null ; then
    echo "Installing Mongodb..."
    wget --quiet "http://downloads.mongodb.org/linux/"$MONGO_DB_ARCHIVE -O $MONGO_DB_ARCHIVE
    tar -zxvf $MONGO_DB_ARCHIVE
    mkdir $MONGO_DB_DIR
    mv $MONGO_DB_EXTRACTED_DIR/* $MONGO_DB_DIR
    rm -rf $MONGO_DB_ARCHIVE
    rm -rf $MONGO_DB_EXTRACTED_DIR
    ln -sf $MONGO_DB_DIR/bin/* /usr/local/sbin
fi

echo "Mongodb is installed."
exit 0
