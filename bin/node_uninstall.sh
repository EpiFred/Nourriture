#!/bin/sh

## Node uninstaller script for linux.

NODE_VERSION=v0.10.33
NODE_DIR=/var/node-$NODE_VERSION

find /usr/local/sbin -lname '$NODE_DIR/bin/node' -delete
find /usr/local/sbin -lname '$NODE_DIR/lib/*' -delete
rm -rf $NODE_DIR
