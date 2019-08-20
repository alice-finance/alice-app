#!/usr/bin/env bash

set -a
[ -f .env ] && . .env
set +a

APP_VERSION=$(./scripts/get_version.sh)

expo publish --release-channel "$APP_VERSION"
