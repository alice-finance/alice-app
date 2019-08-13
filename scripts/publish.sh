#!/usr/bin/env bash

APP_VERSION=$(./scripts/get_version.sh)

expo publish --release-channel "$APP_VERSION"
