#!/bin/bash

BASE_DIR=`dirname $0`

PID=`cat $BASE_DIR/jstd.pid`
kill $PID

rm -f $BASE_DIR/jstd.out $BASE_DIR/jstd.err $BASE_DIR/jstd.pid

PID=`cat $BASE_DIR/phantomjs.pid`
kill $PID

rm -f $BASE_DIR/phantomjs.out $BASE_DIR/phantomjs.err $BASE_DIR/phantomjs.pid
