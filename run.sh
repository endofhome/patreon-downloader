#!/usr/bin/env bash

DIR=${pwd}
cd "$(dirname "$0")" && node ./bin/patreon-downloader.js
cd ${DIR}
