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

echo "writing cue sheet for ${TITLE}"
CUE_FILE_PATH="$(dirname "$FILE_PATH")/$(basename "$FILE_PATH" .wav).cue"
touch "$CUE_FILE_PATH"
cat <<EOF > "$CUE_FILE_PATH"
PERFORMER "${ARTIST_NAME}"
TITLE "Patreon Posts"
REM DATE "${YEAR}"
FILE "$(basename ${FILE_PATH})" WAVE
  TRACK 01 AUDIO
    TITLE "${TITLE}"
    PERFORMER "${ARTIST_NAME}"
    REM COMMENT "${COMMENT}"
    INDEX 01 00:00:00
EOF

echo "downloading artwork for ${TITLE}"
echo "will not embed artwork, saving for later processing."
ARTWORK_FILE_PATH="$(dirname "$FILE_PATH")/$(basename "$FILE_PATH" .wav).jpg"
curl -s ${ARTWORK_URL} --output "${ARTWORK_FILE_PATH}"

source "${__dir}/transfer-wav-to-media-centre.sh" "${TITLE}" "${FILE_PATH}" "$CUE_FILE_PATH" "$ARTWORK_FILE_PATH"
