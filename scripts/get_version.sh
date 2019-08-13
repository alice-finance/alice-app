#!/usr/bin/env bash

APP_VERSION=v$(cat app.json |
  grep version |
  head -1 |
  awk -F: '{ print $2}' |
  sed 's/[",]//g' |
  tr -d '[:space:]')

PUBLISH_VERSION=$(cat app.json |
  grep pubVersion |
  head -1 |
  awk -F: '{ print $2}' |
  sed 's/[",]//g' |
  tr -d '[:space:]')

if [ "$1" = "all" ]; then
  echo "$APP_VERSION"."$PUBLISH_VERSION"
else
  echo "$APP_VERSION"
fi
