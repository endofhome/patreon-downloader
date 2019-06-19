#!/usr/bin/env bash

set -o nounset
set -o pipefail

URL=$1
FILE_PATH=$2
COMMENT=$3
YEAR=$4
TITLE=$5
ARTWORK_URL=$6
ARTIST_NAME=$7

__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "downloading ${TITLE}"
curl -s ${URL} --output "${FILE_PATH}"

echo "tagging ${TITLE}"
id3 -2 -c "$COMMENT" -y ${YEAR} "${FILE_PATH}" >/dev/null 2>&1

echo "checking tags"
METADATA=$(echo "$(id3 "${FILE_PATH}")")

echo "checking for ALBUM tag"
ALBUM_TAG=$(echo "$METADATA" | grep Album | cut -d ':' -f2 | tr -d '[:space:]')
if [[ -z "${ALBUM_TAG}" ]]; then
    echo "ALBUM tag is missing - setting to 'Patreon Posts'"
    id3 -2 -l "Patreon Posts" "${FILE_PATH}" >/dev/null 2>&1
else
    echo "ALBUM tag is present"
fi

echo "checking for ARTIST tag"
ARTIST_TAG=$(echo "$METADATA" | grep Artist | cut -d ':' -f2 | tr -d '[:space:]')
if [[ -z "${ARTIST_TAG}" ]]; then
    echo "ARTIST tag is missing - setting to '${ARTIST_NAME}'"
    id3 -2 -a "${ARTIST_NAME}" "${FILE_PATH}" >/dev/null 2>&1
else
    echo "ARTIST tag is present"
fi

echo "checking for TITLE tag"
TITLE_TAG=$(echo "$METADATA" | grep Title | cut -d ':' -f2 | tr -d '[:space:]')
if [[ -z "${TITLE_TAG}" ]]; then
    echo "TITLE tag is missing - setting to '${TITLE}'"
    id3 -2 -t "${TITLE}" "${FILE_PATH}" >/dev/null 2>&1
else
    echo "TITLE tag is present"
fi

echo "downloading artwork for ${TITLE}"
TITLE_NO_WHITESPACE=$(echo ${TITLE} | sed -e 's/ /_/g')
ARTWORK_FILE_PATH="$(dirname "${BASH_SOURCE[0]}")/../files/cover-${TITLE_NO_WHITESPACE}.jpg"
curl -s ${ARTWORK_URL} --output "${ARTWORK_FILE_PATH}"

echo "embedding artwork"
/usr/local/bin/eyeD3 --add-image "${ARTWORK_FILE_PATH}:FRONT_COVER" "${FILE_PATH}" >/dev/null 2>&1

rm "${ARTWORK_FILE_PATH}"

source "${__dir}/transfer-file-to-media-centre.sh" "${TITLE}" "${FILE_PATH}"
