#!/usr/bin/env bash

DIR=${pwd}
cd "$(dirname "$0")" && ./bin/patreon-downloader.js
cd ${DIR}
