#!/usr/bin/env bash

set -o nounset
set -o errexit
set -o pipefail

TITLE=$1
FILE_PATH=$2
CUE_FILE_PATH=$3
ARTWORK_FILE_PATH=$4

__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "transferring ${TITLE} to media centre"

if [[ $OSTYPE = "darwin"* ]]; then
  DESTINATION=$(echo ${DESTINATION_DIRECTORY} | sed -e 's/ /\\ /g')
else
  DESTINATION=${DESTINATION_DIRECTORY}
fi

if [[ $(uname -a | awk '{print $2}') = ${DESTINATION_MACHINE_NAME} ]]; then
  echo "destination directory located on this machine, using mv"
  mv "${FILE_PATH}" "${DESTINATION}"
  if [[ -n "$CUE_FILE_PATH" ]]; then
    mv "${CUE_FILE_PATH}" "${DESTINATION}"
  fi
  if [[ -n "$ARTWORK_FILE_PATH" ]]; then
    mv "${ARTWORK_FILE_PATH}" "${DESTINATION}"
  fi
else
  echo "destination directory located on a remote machine, using scp"
  scp "${FILE_PATH}" ${DESTINATION_MACHINE_USERNAME}@${DESTINATION_MACHINE_HOST}:"${DESTINATION}"
  rm "${FILE_PATH}"
  if [[ -n "$CUE_FILE_PATH" ]]; then
    scp "${CUE_FILE_PATH}" ${DESTINATION_MACHINE_USERNAME}@${DESTINATION_MACHINE_HOST}:"${DESTINATION}"
    rm "${CUE_FILE_PATH}"
  fi
  if [[ -n "$ARTWORK_FILE_PATH" ]]; then
    scp "${ARTWORK_FILE_PATH}" ${DESTINATION_MACHINE_USERNAME}@${DESTINATION_MACHINE_HOST}:"${DESTINATION}"
    rm "${ARTWORK_FILE_PATH}"
  fi
fi

"${__dir}/update-kodi-audio-library.sh"

echo "$(date +"%Y-%m-%d %H:%M:%S"),$TITLE" >> "$(dirname "${BASH_SOURCE[0]}")/../persistence/downloaded.txt"
echo "processing ${TITLE} completed"
