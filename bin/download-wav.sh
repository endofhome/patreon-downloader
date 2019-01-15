#!/usr/bin/env bash

set -o nounset
set -o errexit
set -o pipefail

URL=$1
FILE_PATH=$2
TITLE=$3

echo "downloading ${TITLE}"
curl -s ${URL} --output ${FILE_PATH}

./bin/transfer-file-to-media-centre.sh ${TITLE} ${FILE_PATH}
