const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

module.exports = function downloadTagAndOrganiseFiles(songs, artistName) {
    const downloadedTitles = fs.readFileSync("persistence/downloaded.txt")
        .toString()
        .split("\n")
        .map(line => {
            return line.split(",")[1];
        });

    songs.map(song => {
        if (downloadedTitles.includes(song.title)) {
            console.log(`Already downloaded ${song.title}`);
        } else {
            if (song.file.endsWith('.mp3') || song.file.endsWith('.wav')) {
                process(song);
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

    function process(song) {
        function reformatNotesForShellScript() {
            return escapeDoubleQuotes(song.notes.join('\n'));
        }

        const mp3Command = `"${path.resolve(__dirname, '../bin/process-file.sh')}" "${song.url}" "${path.resolve(__dirname, '../files/' + song.file)}" "${reformatNotesForShellScript()}\n\n${escapeDoubleQuotes(song.tags)}" ${song.year} "${escapeDoubleQuotes(song.title)}" "${song.artwork}", "${artistName}"`;
        download(mp3Command);
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
