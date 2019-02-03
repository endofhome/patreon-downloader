#!/usr/bin/env bash

set -o nounset
set -o errexit
set -o pipefail

URL=$1
FILE_PATH=$2
TITLE=$3

__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "downloading ${TITLE}"
curl -s ${URL} --output "${FILE_PATH}"

source ${__dir}/transfer-file-to-media-centre.sh "${TITLE}" "${FILE_PATH}"
