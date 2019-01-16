#!/usr/bin/env bash

set -o nounset
set -o errexit
set -o pipefail

curl --data-binary '{ "jsonrpc": "2.0", "method": "AudioLibrary.Scan", "id": "patreon-downloader"}' -H 'content-type: application/json;' http://${KODI_USERNAME}:${KODI_PASSWORD}@${DESTINATION_MACHINE_HOST}:${KODI_PORT}/jsonrpc
