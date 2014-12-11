#!/bin/sh

SERVER_DIR=source/server

cd ../$SERVER_DIR
npm install
npm test
