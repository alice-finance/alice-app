#!/usr/bin/env bash

APP_VERSION=$(./scripts/get_version.sh)

if [ "$1" = "ios" ]; then
  BUILD_COMMAND="build:ios"
  ADDITIONAL_ARGS=""
elif [ "$1" = "android" ]; then
  BUILD_COMMAND="build:android"
  ADDITIONAL_ARGS="--type=app-bundle"
else
  echo "should pass platform! (ios|android)"
  exit 1
fi

expo "$BUILD_COMMAND" --release-channel "$APP_VERSION" "${ADDITIONAL_ARGS}" --no-publish
