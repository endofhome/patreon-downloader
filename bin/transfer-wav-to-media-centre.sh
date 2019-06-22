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
  mv "${CUE_FILE_PATH}" "${DESTINATION}"
  mv "${ARTWORK_FILE_PATH}" "${DESTINATION}"
else
  echo "destination directory located on a remote machine, using scp"
  scp "${FILE_PATH}" ${DESTINATION_MACHINE_USERNAME}@${DESTINATION_MACHINE_HOST}:"${DESTINATION}"
  scp "${CUE_FILE_PATH}" ${DESTINATION_MACHINE_USERNAME}@${DESTINATION_MACHINE_HOST}:"${DESTINATION}"
  scp "${ARTWORK_FILE_PATH}" ${DESTINATION_MACHINE_USERNAME}@${DESTINATION_MACHINE_HOST}:"${DESTINATION}"
  rm "${FILE_PATH}"
  rm "${CUE_FILE_PATH}"
  rm "${ARTWORK_FILE_PATH}"
fi

"${__dir}/update-kodi-audio-library.sh"

echo "$(date +"%Y-%m-%d %H:%M:%S"),$TITLE" >> "$(dirname "${BASH_SOURCE[0]}")/../persistence/downloaded.txt"
echo "processing ${TITLE} completed"
