const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

module.exports = function downloadTagAndOrganiseFiles(songs, artistName) {
    let downloaded;
    try {
        downloaded = fs.readFileSync("persistence/downloaded.txt", "utf8")
    } catch (e) {
        downloaded = "";
    }

    const downloadedTitles = downloaded
        .split("\n")
        .filter(Boolean)
        .map(line => {
            return line.split(",")[1];
        });

    songs.map(song => {
        if (downloadedTitles.includes(song.title)) {
            console.log(`Already downloaded ${song.title}`);
        } else {
            if (song.file.endsWith('.mp3')) {
                processMp3(song);
            } else if (song.file.endsWith('.wav')) {
                processWav(song);
            } else {
                throw {
                    message: `Song file is neither mp3 not wav.`,
                    song: song
                };
            }
        }
    });

    function escapeDoubleQuotes(s) {
	    return s.replace(/"/g, '\\"');
    }

    function reformatNotesForShellScript(song) {
        return escapeDoubleQuotes(song.notes.join('\n'));
    }

    function processMp3(song) {
        const mp3Command = `"${path.resolve(__dirname, '../bin/process-mp3.sh')}" "${song.url}" "${path.resolve(__dirname, '../files/' + song.file)}" "${reformatNotesForShellScript(song)}\n\n${escapeDoubleQuotes(song.tags)}" ${song.year} "${escapeDoubleQuotes(song.title)}" "${song.artwork}" "${artistName}"`;
        download(mp3Command);
    }

    function processWav(song) {
        const wavCommand = `"${path.resolve(__dirname, '../bin/process-wav.sh')}" "${song.url}" "${path.resolve(__dirname, '../files/' + song.file)}" "${reformatNotesForShellScript(song)}\n\n${escapeDoubleQuotes(song.tags)}" ${song.year} "${escapeDoubleQuotes(song.title)}" "${song.artwork}" "${artistName}"`;
        download(wavCommand);
    }

    function download(command) {
        exec(command, (error, stdout, stderr) => {
            console.log(`${stdout}`);
            console.log(`${stderr}`);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
    }
};
