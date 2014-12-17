#!/bin/sh

## Script to launch Node server tests. (executed on the continuous integration repository).

SERVER_DIR=source/server

cd ../$SERVER_DIR
npm install
npm test
