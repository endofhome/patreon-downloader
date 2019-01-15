#!/usr/bin/env bash

set -o nounset
set -o errexit
set -o pipefail

URL=$1
FILE_PATH=$2
COMMENT=$3
YEAR=$4
TITLE=$5
ARTWORK_URL=$6

echo "downloading ${TITLE}"
curl -s ${URL} --output ${FILE_PATH}

echo "tagging ${TITLE}"
id3 -c "$COMMENT" -y ${YEAR} ${FILE_PATH} >/dev/null 2>&1

echo "downloading artwork for ${TITLE}"
TITLE_NO_WHITESPACE=$(echo ${TITLE} | sed -e 's/ /_/g')
ARTWORK_FILE_PATH="files/cover-${TITLE_NO_WHITESPACE}.jpg"
curl -s ${ARTWORK_URL} --output ${ARTWORK_FILE_PATH}

echo "adding artwork"
eyeD3 --add-image "${ARTWORK_FILE_PATH}:FRONT_COVER" ${FILE_PATH} >/dev/null 2>&1

rm ${ARTWORK_FILE_PATH}

./transfer-file-to-media-centre.sh "${TITLE}" ${FILE_PATH}
