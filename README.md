# Patreon downloader

### Summary

A collection of scripts to enable automatic downloading, tagging and organising of audio files posted by Patreon creators. The script uses [Puppeteer](https://developers.google.com/web/tools/puppeteer/) to control an instance of the Chromium browser. A Patreon account is required, and if you want to access subscription-only content, you will need to pay for it. This script purely replaces a manual process with an automated one. It can be run on a cron job or by some other scheduling mechanism.

The script supports downloading of mp3 and wav files. mp3 files will also have a comment (COMM) id3v2 tag added, the content of which will be the text content of the blog post, followed by any tags set by the creator. The post's associated image will also be embeded as album art in the file. As wav does not officially support such metadata, no such tagging/embedding will occur. Instead a cue sheet will be written and transferred along with the audio and artwork files.

The script keeps track of any files downloaded in a text file and will not re-download them. Once files have been downloaded they will be moved to a final destination directory (for me, a hard disk attached to my media centre), either on the same machine using `mv` or elsewhere using `scp`.

Once the file is downloaded, an update of the audio library in a Kodi installation is triggered (given the correct configuration).

### Dependencies
* [nodeJS](https://nodejs.org)
* [cURL](https://curl.haxx.se/)
* [id3 A.K.A. id3mtag](https://squell.github.io/id3/) (do not be confused by [id3](http://manpages.ubuntu.com/manpages/cosmic/en/man1/id3.1.html) on Ubuntu systems, this is not the same tool)
* [eyeD3](https://eyed3.readthedocs.io/en/latest/) (requires Python 2.7+ and libmagic)

To install id3mtag on macOS, refer to my blog post at [https://endofhome.github.io/2019/01/11/compiling_id3mtag_for_macos.html](https://endofhome.github.io/2019/01/11/compiling_id3mtag_for_macos.html)

eyeD3 can be installed via `pip`: ```pip install eyeD3```
It requires a working installation of `libmagic`. On macOS this can easily be installed via Homebrew: ```brew install libmagic```, or on Ubuntu, ```apt-get install libmagic```.

### Configuration

As well as the required environment variables (listed below), the script requires a logged-in session cookie. I dumped my cookies to a JSON file using a browser extension. The only cookie required (at the time of writing) is `session_id` for the domain `.patreon.com`. The script requires the session cookie to be stored as a JSON object inside a JSON array in a file named `cookies.json` at root level.
 
Environment variables:

| Variable | Description|
|----------|------------|
| PATREON_ARTIST | The Patreon artist/creator that you are supporting, as per the URL of their Patreon page |
| PATREON_ARTIST_NAME | The name of the artist/creator |
| DESTINATION_DIRECTORY |    The directory you want to save your files in. For me, a directory in a disk attached to my media centre. This directory doesn't have to be on the same machine as you are running the script on, if you have an ssh key stored the script will be able to use `scp` to transfer the files |
| DESTINATION_MACHINE_NAME | Name of the machine where the destination directory exists |
| DESTINATION_MACHINE_USERNAME | Username for the account you will use to `scp` into the destination machine |
| DESTINATION_MACHINE_HOST | Host for the destination machine (used for `scp`) |
| KODI_USERNAME | Username for Kodi installation |
| KODI_PASSWORD | Password for Kodi installation |
| KODI_PORT | Port for Kodi installation |

### How do I run it?

`npm i` to install the nodeJS dependencies.

Install other dependencies mentioned above, and ensure the `cookies.json` file and necessary environment variables are present.

`./run.sh` will start the process.








