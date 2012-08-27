#!/bin/bash

BASE_DIR=`dirname $0`
PORT=9876

echo "Starting JsTestDriver Server (http://code.google.com/p/js-test-driver/)"
echo "Please open the following url and capture one or more browsers:"
echo "http://localhost:$PORT"

nohup java -jar "$BASE_DIR/../test/lib/jstestdriver/JsTestDriver.jar" \
     --port $PORT \
     --browserTimeout 20000 \
     --config "$BASE_DIR/../config/jsTestDriver.conf" \
     --basePath "$BASE_DIR/.." > $BASE_DIR/jstd.out 2> $BASE_DIR/jstd.err < /dev/null &
echo $! > "$BASE_DIR/jstd.pid"

sleep 2

nohup phantomjs "$BASE_DIR/../test/lib/phantomjs-jstd.js" > $BASE_DIR/phantomjs.out 2> $BASE_DIR/phantomjs.err < /dev/null &
echo $! > "$BASE_DIR/phantomjs.pid"
